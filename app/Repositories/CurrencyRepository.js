const Currency = use('App/Models/Currency');

class CurrencyRepository {

    /**
    * The method who give us the money for value and quantity in the Currency.
    * @return {Array<Currency>} - The array of the all values of the Currency
    */

    async findAll() {
        return await Currency.all();
    }

    /**
    * The method who give us the money for value and quantity in the Currency.
    * @param  {integer} value - the value of the coins or money
    * @return {Currency} - The array of the all values of the Currency
    */

    async findByValue(value) {
        return await Currency.findBy('value', value)
    }

    /**
    * The method who update or created the quantity and the value for the Currency
    * @param  {integer} value - the value of the coins or money
    * @param  {integer} quantity - the quantity of the coins or money per value
    * @return {Currency} the tuple of the value and the quantity
    */

    async createOrUpdateByValue(value, quantity) {
        const currency = await this.findByValue(value) || new Currency();

        if (currency.value) {
            currency.value = value;
            currency.quantity += parseInt(quantity);
            await currency.save();
            return currency;
        }

        currency.value = value;
        currency.quantity = quantity;

        await currency.save();

        return currency;
    }
}

module.exports = CurrencyRepository
