## Examen de ISW613 - Aplicaciones web

## Instalar dependencias en backend
Inicialización de proyecto
```bash
cd backend
npm init -y

```

```bash

npm install express prisma @prisma/client dotenv
```

```bash

npx prisma init --datasource-provider postgresql

```

## Prueba de conexión

Para esto podemos hacerlo con el siguiente comando

``` bash

npx prisma validate

```

Se espera la siguiente salida

``` bash

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

```

Otra forma es realizar mediante la ejecución de lo siguiente

``` bash
cd backend
node .\src\test_connection.js
```

Se espera que la salida sea unos corchetes vacios [], esto dado que la tabla creada es una donde no se tiene ningun dato dado que se creó para pruebas.