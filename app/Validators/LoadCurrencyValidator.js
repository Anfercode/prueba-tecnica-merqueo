const { StatusCodes } = use('http-status-codes')

class LoadCurrencyValidator {
  get rules() {
    return {
      value: 'required|integer|in:50,100,200,500,1000,5000,10000,20000,50000,100000',
      quantity: 'required|integer|above:0'
    };
  }

  get messages() {
    return {
      required: 'The {{field}} is required',
      integer: 'The {{field}} must be a integer',
      in: 'The {{field}} not in 50, 100, 200, 500, 1000, 5000, 10000, 20000, 50000, 100000',
      adobe: 'The {{field}} cannot be less than 0',
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
