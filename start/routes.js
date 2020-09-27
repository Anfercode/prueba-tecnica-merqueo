/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {

    Route.get('/money', 'CurrencyController.getAllMoney');
    Route.post('/load-money', 'CurrencyController.loadMoney').validator('LoadCurrencyValidator');
    Route.put('/withdraw', 'CurrencyController.withDraw');
    Route.post('/payment', 'CurrencyController.payment').validator('PaymentValidator');

}).prefix('currency');
