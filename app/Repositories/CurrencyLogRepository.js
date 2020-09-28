const CurrencyLog = use('App/Models/CurrencyLog');

class CurrencyLogRepository {
    /**
    * The method who give us the Log.
    * @return {Array<CurrencyLog>} - The array of the all values of the CurrencyLog
    */

    async findAll() {
        return await CurrencyLog.all();
    }

    /**
    *  The method of find the currency log by timestamp
    * @param {Moment} timestamp timestamp to filter.
    * @return {Array<CurrencyLog>}
    */
    async findByCreationDate(timestamp) {
        return await CurrencyLog.findBy('created_at', timestamp)
    }

    /**
    * The method of create a new log in the CurrencyLog
    * @param {String} operation the type of operation.
    * @param {String} input the information of the operation.
    * @param {String} before the information of the ATM before the change.
    * @return {void}
    */

    async create(operation, input, before) {
        const currencyLog = new CurrencyLog();
        currencyLog.operation = operation;
        currencyLog.input = input;
        currencyLog.before = before;
        await currencyLog.save();
    }
}

module.exports = CurrencyLogRepository;