const moment = require('moment');
const CurrencyLogRepository = require('../../Repositories/CurrencyLogRepository');

class CurrencyLogController {

    constructor() {
        this.repository = new CurrencyLogRepository();
    }

    /**
    * The method of get the history logs
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @return {Void}
    */
    async getCurrencyHistory({ request, response }) {
        const { date, time } = request.get()
        if (date && time) {
            const timestamp = moment(date + ' ' + time).format('YYYY-MM-DD HH:mm:ss')
            return await this.repository.findByCreationDate(timestamp);
        }
        return await this.repository.findAll();
    }

    /**
    * The method create a register in the log
    * @param {String} operation the type of operation.
    * @param {String} input the information of the operation.
    * @param {String} before the information of the ATM before the change.
    * @return {void}
    */
    async createLog(operation, input, before) {
        await this.repository.create(operation, input, before);
    }
}

module.exports = CurrencyLogController
