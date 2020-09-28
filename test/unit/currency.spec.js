const { test, trait } = use('Test/Suite')('Currency')
const { StatusCodes } = use('http-status-codes');
const Currency = use('App/Models/Currency')

trait('Test/ApiClient')

test('Load data with a bad value', async ({ client }) => {
  const response = await client.post('/currency/load-money').send({
    value: "600000",
    quantity: "1"
  }).end()

  response.assertStatus(StatusCodes.BAD_REQUEST)
  response.assertJSONSubset([{
    message: "The value not in 50, 100, 200, 500, 1000, 5000, 10000, 20000, 50000, 100000",
    field: "value",
    validation: "in"
  }])
})

test('Load data with a bad quantity', async ({ client }) => {
  const response = await client.post('/currency/load-money').send({
    value: "100000",
    quantity: "0"
  }).end()

  response.assertStatus(StatusCodes.BAD_REQUEST)
  response.assertJSONSubset([{
    message: "above validation failed on quantity",
    field: "quantity",
    validation: "above"
  }])
})

test('Set payment with no change', async ({ client }) => {

  const response = await client.post('/currency/payment').send({
    bill: "100000",
    money: [{
      value: "100000",
      quantity: "2"
    }]
  }).end()

  response.assertStatus(StatusCodes.PRECONDITION_FAILED);
  response.assertJSONSubset({
    code: "NOT_ENOUGHT_MONEY",
    message: "The ATM does not have enough money to give change"
  })
})


test('Set payment with no change', async ({ client }) => {

  Currency.create({
    value: '100000',
    quantity: '1'
  })

  const response = await client.post('/currency/payment').send({
    bill: "300150",
    money: [{
      value: "50",
      quantity: "5"
    }]
  }).end()

  response.assertStatus(StatusCodes.PRECONDITION_FAILED);
  response.assertJSONSubset({
    code: "GREATER_THAN_PAYMENT",
    message: "The bill is greater than the payment"
  })
})