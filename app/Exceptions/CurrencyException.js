'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

const { StatusCodes } = use('http-status-codes')
const message = 'Currency alredy exist'
const status = StatusCodes.BAD_REQUEST
const code = 'CURRENCY_EXISTS'

class CurrencyException extends LogicalException {
  handle (error, { response }) {
    response
      .status(status)
      .send({ message, code })
  }
}

module.exports = CurrencyException
