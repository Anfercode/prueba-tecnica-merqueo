const { StatusCodes } = use('http-status-codes')

class LoadCurrencyValidator {
  get rules() {
    return {
      value: 'required|integer|in:50,100,200,500,1000,5000,10000,20000,50000,100000',
      quantity: 'required|integer'
    };
  }

  get messages() {
    return {
      required: 'The {{field}} is required',
      int: 'The {{field}} must be a integer',
      'in.value': 'The {{field}} not in 50, 100, 200, 500, 1000, 5000, 10000, 20000, 50000, 100000'
    };
  }

  get validateAll() {
    return true;
  }

  async fails(errorMessages) {
    return this.ctx.response.status(StatusCodes.BAD_REQUEST).json(errorMessages);
  }
}

module.exports = LoadCurrencyValidator
