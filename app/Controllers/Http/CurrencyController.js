const { StatusCodes } = use('http-status-codes')
const CurrencyRepository = require('../../Repositories/CurrencyRepository');
const CurrencyException = use('App/Exceptions/CurrencyException')

class CurrencyController {

    constructor() {
        this.repository = new CurrencyRepository();
    }

    async loadMoney({ request, response }) {
        const { value, quantity } = request.post();
        const currency = await this.repository.createOrUpdateByValue(value, quantity);
        response.status(StatusCodes.CREATED).send({ "message": "Currency created", "info": currency })
    }

    async getAllMoney() {
        try {
            return this.repository.findAll();
        } catch (error) {
            response.send(error);
        }
    }
}

module.exports = CurrencyController
