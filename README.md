# Prueba Técnica Merqueo :pig:

## Dependencias.

- Node 14.12
- Adonis.js 4.1.0
- Postgres 10

## Instalación.

Instalamos Adonis.

```
    npm i -g @adonisjs/cli
```

Instalamos la dependencias del proyecto.

```
    npm install
```

En el archivo `.env` configuramos lo siguiente.
```
    HOST=127.0.0.1
    PORT=3333
    NODE_ENV=development
    APP_URL=http://${HOST}:${PORT}
    CACHE_VIEWS=false
    APP_KEY=
    DB_CONNECTION=pg
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_USER=
    DB_PASSWORD=
    DB_DATABASE=atm
    SESSION_DRIVER=cookie
    HASH_DRIVER=bcrypt
```
Se tiene que crear la base de datos atm antes de ejecutar este paso, para llenar este archivo nos basamos en el .env.example.

Seguidamente corremos las migraciones con el comando.
```
    adonis migration:run
```

Y por último para correr la app utilizaríamos el siguiente comando.
```
    npm start
```

Para correr tests, ejecutamos el siguiente comando.

```
    npm test
```

Y por último la colección de postman se encuentra en la ruta `./postman`

## Problemas

### Problema 1:

Ingresar una base de dinero especificando la denominación de cada
moneda/billete, ejemplo:

- 5 billetes de 20000
- 10 billetes de 10000
- 15 monedas de 500
- 20 monedas de 200

### Solución:

Esto se hizo con el endpoint de `currency/load-data` creamos un modelo de currency que tendrían los campos value y quantity, value seria la denominacion y quantity la cantidad de esa denominación, ya después creamos el repositorio para ese modelo, de esa manera poder manejar los métodos del modelo de manera más legible, después creamos el método que se encarga de crear o actualizar el currency de pendiendo del caso, el controlador de buscar si el registro existe o no para después añadir el monto adicional o crear el currency.


### Problema 2:

Transar únicamente con las siguientes denominaciones de
monedas/billetes:

- 100000
- 50000
- 20000
- 10000
- 5000
- 1000
- 500
- 200
- 100
- 50

### Solución:

La ventaja de usar Adonis.js es que nos ayuda al momento de tener que hacer validaciones, en la carpeta `app/validator` y creando un archivo validator con el comando `adonis make:validator`, podemos ligar validaciones al momento de hacer el request.

### Problema 3:

Registrar un pago por cierto monto donde se especifique con qué
monedas/billetes se desea realizar el pago e indicar el más óptimo
cambio posible a devolver al cliente, de modo que la caja no se quede
sin sencillo. Por ejemplo, si se realiza el pago de una compra de 10 mil
con un billete de 50 mil y hay suficientes billetes de 10 mil y 20 mil,
el cambio más óptimo a devolver serían 2 billetes de 20 mil y NO 4 de 10
mil. Como es de esperarse, el saldo de la caja luego de un pago exitoso
debe aumentar.

### Solución:

Con el endpoint de `currency/payment` agrego la lógica para solucionar este problema, aquí ya fue un poco más complejo, en el controller de Currency, implemente un greedy algorithm que me ayudara a saber la forma más optima de cuantos billetes/monedas hay que darle al usuario al momento de realizar el pago.

### Problema 4:

Validar si la caja tiene el cambio para devolver al cliente, de no
tenerlo entonces se debe lanzar un error descriptivo del caso.

### Solución:

Como en el caso de los Validators, Adonis también nos ayuda a crear una excepción personalizable, para saber si hay que arrojar la excepción, el greedy algorithm también ayuda a esto, ya que si el método encargado de devolver los billetes/monedas retorna vacío, es que no hay la manera de poder devolver al usuario y con esto sabemos cuando disparar la condición.

### Problema 5:

Visualizar el total de dinero que tiene la caja donde se especifique
cuántas monedas/billetes de cada denominación posee.

### Solución:

En el endpoint `currency/money`, esta implementada tanto en el repositorio como en el controlador, el método que nos trae toda la información de los billetes/monedas que se encuentran en el cajero.

### Problema 6:

Visualizar un log completo de los movimientos realizados en la caja,
donde se indique la fecha y hora del monto que salió o entró el dinero.

### Solución:

En el endpoint `/currency/log`, nos mostrara el histórico de transacciones que han ocurrido en el cajero, ya sea la carga de dinero, pagos, y vaciar el cajero, esto fue solucionado haciendo una instancia del método para crear los logs en cada método de Currency con el tipo de la transacción, el input de la petición y él como estaba el cajero antes de la transacción.

### Problema 7:

Saber el estado de la caja en determinada fecha y hora según los logs de
eventos. La suma de los montos en los eventos de entrada/salida de
dinero en los logs deben tener la capacidad de recrear el estado de la caja en determinado punto de la historia.

### Solución:

En el mismo endpoint de logs, podemos ingresar los parámetros de fecha y hora para saber, gracias al before de la tabla, como estaba la caja en esa fecha.


### Problema 8:

Retirar todo el dinero ingresado en la caja dejando el saldo en 0.

### Solución:

Aquí fue bastante sencillo, lo único que se hizo fue hacer que el endpoint hiciera un update a todos los registros en Currency dejando el quantity en 0.
