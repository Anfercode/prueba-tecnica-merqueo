const { StatusCodes } = use('http-status-codes')

class PaymentValidator {
  get rules() {
    return {
      bill: 'required|integer|above:0',
      money: 'required|array'
    };
  }

  get messages() {
    return {
      required: 'The {{field}} is required',
      integer: 'The {{field}} must be a integer',
      adobe: 'The {{field}} cannot be less than 0'
    };
  }

  get validateAll() {
    return true;
  }

  async fails(errorMessages) {
    return this.ctx.response.status(StatusCodes.BAD_REQUEST).json(errorMessages);
  }
}


module.exports = PaymentValidator
