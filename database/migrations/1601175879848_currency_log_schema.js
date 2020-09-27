'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CurrencyLogSchema extends Schema {
  up () {
    this.create('currency_logs', (table) => {
    table.increments()
    table.string('operation').notNullable()
    table.json('info').notNullable()
    table.timestamps()
    })
  }

  down () {
    this.drop('currency_logs')
  }
}

module.exports = CurrencyLogSchema
