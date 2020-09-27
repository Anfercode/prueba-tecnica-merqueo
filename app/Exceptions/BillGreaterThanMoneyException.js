const { HttpException } = require('@adonisjs/generic-exceptions');
const { StatusCodes } = use('http-status-codes');

const message = 'The bill is greater than the payment';
const status = StatusCodes.PRECONDITION_FAILED;
const code = 'GREATER_THAN_PAYMENT';

class BillGreaterThanMoneyException extends HttpException {
  constructor() {
    super(message, status, code)
  }

  handle (error, { response }) {
    response
      .status(this.status)
      .send({code, message})
  }
}

module.exports = BillGreaterThanMoneyException
