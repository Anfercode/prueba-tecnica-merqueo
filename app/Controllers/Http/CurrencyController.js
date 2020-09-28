const { StatusCodes } = use('http-status-codes')
const CurrencyRepository = require('../../Repositories/CurrencyRepository');
const NotEnoughtMoneyToGiveChangeException = use('App/Exceptions/NotEnoughtMoneyToGiveChangeException')
const BillGreaterThanMoneyException = use('App/Exceptions/BillGreaterThanMoneyException')
const CurrencyLogController = require('./CurrencyLogController')
const _ = use('lodash')

class CurrencyController {

    constructor() {
        this.repository = new CurrencyRepository();
        this.currencyLog = new CurrencyLogController();
    }

    /**
    * The method to load the money to ATM
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @return {Void}
    */
    async loadMoney({ request, response }) {
        try {
            const { value, quantity } = request.post();
            const allData = await this.repository.findAll();
            const quantityTotal = await this.getQuantityTotal(value, quantity);
            const currency = await this.repository.createOrUpdateByValue(value, quantityTotal);
            this.currencyLog.createLog('load-money', JSON.stringify(request.post()), JSON.stringify(allData.rows));
            response.status(StatusCodes.CREATED).send({ "message": "Load successful", "info": currency })
        } catch (error) {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
        }
    }

    /**
    * The method to get the quantity if is a new currency or a exist currency
    * @param {Integer} value - the value of the currency
    * @param {Integer} quantity - the quantity of currency
    * @return {Integer}
    */
    async getQuantityTotal(value, quantity){
        const currency = await this.repository.findByValue(value);
        if(currency){
            return parseInt(quantity) + currency.quantity || 0;
        }

        return quantity
    }

    /**
    * The method to get all currencies in ATM
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
    * The method to withdraw all the money in the ATM
    * @param {object} ctx
    * @param {Response} ctx.response
    * @return {Void}
    */
    async withDraw({ response }) {
        try {
            const allData = await this.repository.findAll();
            await this.repository.updateAllQuantityInZero()
            await this.currencyLog.createLog('withdraw', '{}', JSON.stringify(allData.rows));
            response.status(StatusCodes.OK).send({ "message": "you have withdraw all your money" })
        } catch (error) {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
        }
    }

    /**
    * The Method to make the payment in the ATM
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
        await this.currencyLog.createLog('payment', JSON.stringify(request.post()), JSON.stringify(totalMoneyInCurrency.rows));

        response.status(StatusCodes.OK).send({ "change": quantityChange });
    }

    /**
    * The method to get the total money enter by the user.
    * @param {Array<Currency>} money - This attribute has the information on the payment values and quantities
    * @return {Integer} - the total value of the clients payment
    */
    getTotalMoney(money) {
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        return money.map(data => data.value * data.quantity).reduce(reducer);
    }

    /**
    * The method calculates the quantity of money to give the user.
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
    * The method that updates the currency for the payment.
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
    * The method to get the quantity total to payment.
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
