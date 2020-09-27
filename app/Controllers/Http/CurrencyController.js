const { StatusCodes } = use('http-status-codes')
const CurrencyRepository = require('../../Repositories/CurrencyRepository');
const NotEnoughtMoneyToGiveChangeException = use('App/Exceptions/NotEnoughtMoneyToGiveChangeException')
const BillGreaterThanMoneyException = use('App/Exceptions/BillGreaterThanMoneyException')
const _ = use('lodash')

class CurrencyController {

    constructor() {
        this.repository = new CurrencyRepository();
    }

    /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @return {Void}
   */
    async loadMoney({ request, response }) {
        const { value, quantity } = request.post();
        const currency = await this.repository.createOrUpdateByValue(value, quantity);
        response.status(StatusCodes.CREATED).send({ "message": "Load successful", "info": currency })
    }

    /**
   * @param {object} ctx
   * @param {Response} ctx.response
   * @return {Void}
   */
    getAllMoney({ response }) {
        try {
            return this.repository.findAll();
        } catch (error) {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
        }
    }

    /**
   * @param {object} ctx
   * @param {Response} ctx.response
   * @return {Void}
   */
    withDraw({ response }) {
        this.repository.updateAllQuantityInZero()
        response.status(StatusCodes.OK).send({ "message": "you have withdraw all your money" })
    }


    /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @return {Void}
   */
    async payment({ request, response }) {
        const { bill, money } = request.post();
        const totalMoneyInCurrency = await this.repository.findAll();
        const totalValuesInCurrency = [];
        const pay = await this.getTotalMoney(money)
        const change = pay - bill;

        if (change < 0) {
            throw new BillGreaterThanMoneyException();
        }

        totalMoneyInCurrency.rows
            .filter(currency => currency.quantity > 0)
            .forEach(currency => totalValuesInCurrency.push(currency.value))

        const quantityChange = this.greedyMoneyChange(totalValuesInCurrency.sort((a, b) => b - a), change, [])

        if (!quantityChange) {
            throw new NotEnoughtMoneyToGiveChangeException()
        }

        await this.currencyAdjustment(quantityChange, money);

        response.status(StatusCodes.OK).send({ "change": quantityChange });
    }

    /**
   * @param {Array<Currency>} money - This attribute has the information on the payment values and quantities
   * @return {Integer} - the total value of the clients payment
   */
    getTotalMoney(money) {
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        return money.map(data => data.value * data.quantity).reduce(reducer);
    }

    /**
   * @param {Array<Integer>} totalValuesInCurrency - The list of values un the ATM
   * @return {Array<Integer>} - the total value of the clients payment
   */
    greedyMoneyChange(totalValuesInCurrency, change, result) {
        if (change <= 0) {
            return result;
        }

        for (let i = 0; i < totalValuesInCurrency.length; i++) {
            if (change - totalValuesInCurrency[i] >= 0) {
                return this.greedyMoneyChange(
                    totalValuesInCurrency,
                    change - totalValuesInCurrency[i],
                    result.concat(totalValuesInCurrency[i]));
            }
        }
    }

    /**
   * @param {Array<Integer>} valueArray - This attribute has the information on the payment values and quantities
   * @param {Array<Integer>} money - the total value of the clients payment
   * @return {Void}
   */
    async currencyAdjustment(valueArray, money) {
        const duplicates = _.groupBy(valueArray, function (n) { return n });
        const entries = Object.entries(duplicates)

        entries.forEach(async value => {
            const currency = await this.repository.findByValue(value[0]);
            const QuantityAdd = money.filter(data => data.value == value[0]).map(data => data.quantity);
            const jsonUpdate = {
                value: value[0],
                quantity: this.getAjustmentQuantity(currency.quantity, value[1].length, QuantityAdd[0])
            }

            this.repository.updateByValue(jsonUpdate.value, jsonUpdate.quantity);
        })
    }

    /**
   * @param {Integer} currencyQuantity - The current quantity in the ATM
   * @param {Integer} discountQuantity - The quantity to discount to the ATM
   * @param {Integer} countQuantity - The quantity to add to the ATM
   * @return {Integer}
   */
    getAjustmentQuantity(currencyQuantity, discountQuantity, countQuantity) {
        return (currencyQuantity - discountQuantity) + countQuantity
    }
}

module.exports = CurrencyController
