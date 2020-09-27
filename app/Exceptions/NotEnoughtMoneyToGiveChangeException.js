'use strict'

const { HttpException } = require('@adonisjs/generic-exceptions')
const { StatusCodes } = use('http-status-codes')

const message = 'The ATM does not have enough money to give change'
const status = StatusCodes.PRECONDITION_FAILED
const code = 'NOT_ENOUGHT_MONEY'

class NotEnoughtMoneyToGiveChangeException extends HttpException {
  constructor() {
    super(message, status, code)
  }

  handle (error, { response }) {
    response
      .status(this.status)
      .send({code, message})
  }
}

module.exports = NotEnoughtMoneyToGiveChangeException
