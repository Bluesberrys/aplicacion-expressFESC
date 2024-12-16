import express from 'express';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const { verbose } = sqlite3;
const app = express();

app.use(cors());
const jsonParser = bodyParser.json()


// Abre la base de datos de SQLite
const db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Tabla tareas creada o ya existente.');
        }
    });
});

// Nuevo endpoint agrega_todo para agregar tareas
app.post('/agrega_todo', jsonParser, (req, res) => {
    // Extraer el todo del cuerpo de la solicitud
    const { todo } = req.body;

    // Validar que se proporcione el todo
    if (!todo) {
        return res.status(400).json({ 
            error: 'Falta información necesaria', 
            message: 'Se requiere el campo "todo"' 
        });
    }

    // Obtener el timestamp Unix actual
    const createdAt = Math.floor(Date.now() / 1000);

    // Preparar la declaración SQL para insertar
    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, ?)');

    // Ejecutar la inserción
    stmt.run(todo, createdAt, function(err) {
        if (err) {
            console.error("Error al insertar:", err);
            return res.status(500).json({ 
                error: 'Error al guardar la tarea', 
                message: err.message 
            });
        }

        // Finalizar la declaración
        stmt.finalize();

        // Responder con estado 201 y un JSON vacío
        res.status(201).json({"Status": 201});
    });
});

// Nuevo endpoint para listar todos los elementos
app.get('/obtener_todos', (req, res) => {
    // Comando SELECT para obtener todos los elementos
    db.all('SELECT id, todo, created_at FROM todos ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error("Error al recuperar todos:", err);
            return res.status(500).json({ 
                error: 'Error al recuperar tareas', 
                message: err.message 
            });
        }

        // Devolver la lista de tareas en formato JSON
        res.status(200).json(rows);
    });
});

//Creamos un endpoint de login que recibe los datos como json
app.post('/insert', jsonParser, function (req, res) {
    //Imprimimos el contenido del campo todo
    const { todo } = req.body;

    console.log(todo);
    res.setHeader('Content-Type', 'application/json');


    if (!todo) {
        res.status(400).send('Falta información necesaria');
        return;
    }
    const stmt  =  db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)');

    stmt.run(todo, (err) => {
        if (err) {
          console.error("Error running stmt:", err);
          res.status(500).send(err);
          return;

        } else {
          console.log("Insert was successful!");
        }
    });

    stmt.finalize();

    //Enviamos de regreso la respuesta
    res.setHeader('Content-Type', 'application/json');
    res.status(201).send();
})


app.get('/', function (req, res) {
    //Enviamos de regreso la respuesta
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok2' }));
})


//Creamos un endpoint de login que recibe los datos como json
app.post('/login', jsonParser, function (req, res) {
    //Imprimimos el contenido del body
    console.log(req.body);

    //Enviamos de regreso la respuesta
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok' }));
})

//Corremos el servidor en el puerto 3000
const port = 3000;

app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`)
})


/* 1. El objetivo de esta actividad es recibir los datos del formulario de la aplicación móvil en el servidor y almacenarlos en una base de datos SQLite.
 d) Crea un endpoint llamado "agrega_todo" que reciba datos usando POST.
 e) Crea una tabla "todos" en SQLite con los siguientes campos: id INTEGER PRIMARY KEY AUTOINCREMENT, todo TEXT NOT NULL, created_at INTEGER.
 f) Modifica el código del endpoint POST para guardar los datos en la base de datos SQLite utilizando un INSERT. En el campo "created_at", deberás almacenar el "unix timestamp" con la fecha de inserción.
 g) Instala POSTMAN en tu equipo y envía una petición de tipo application/json al endpoint anterior. Verifica que los datos se guarden en la base de datos SQLite.
 h) Asegúrate de devolver un JSON con un estado HTTP 201 en la respuesta.
 i) Incluye capturas de pantalla con sus respectivas explicaciones. Posteriormente, sube este archivo en formato PDF a la plataforma.

2. El objetivo de esta actividad es enviar los datos a la aplicación Node.js del paso anterior desde la aplicación móvil, en lugar de usar POSTMAN.
 a) Investiga cuáles son los estados HTTP más comunes. ¿Qué significa un estado HTTP 201?
 b) Ejecuta la aplicación Node.js usando CodeSpace y apunta la dirección del tunel.
 d) Modifica la aplicación móvil con la dirección del túnel. Verifica que los datos se estén guardando en la base de datos SQLite.
 e) Modifica el código de la aplicación para mostrar una alerta (Alert) con un mensaje de éxito si el estado de la respuesta de la aplicación Node.js es 201.
 f) Incluye capturas de pantalla con sus respectivas explicaciones y el enlace de tu Snack en un documento. 

3. El objetivo de esta actividad es crear un endpoint para listar los datos de las tareas pendientes en la aplicación Node.js.
 a) Modifica el código de la aplicación Node.js para que devuelva una lista de elementos en formato JSON utilizando un comando SELECT.
 b) Ejecuta la aplicación y usa POSTMAN para verificar que el endpoint funcione correctamente.
 c) Incluye capturas de pantalla con sus respectivas explicaciones y anota tus respuestas en un documento.



4. El propósito de esta actividad es agregar un componente "FlatList" a la aplicación móvil para, posteriormente, mostrar los datos de la aplicación Node.js.
 a) Investiga para qué sirve el componente FlatList de Expo.
 b) Modifica tu aplicación móvil para incluir un FlatList debajo del botón del formulario.
 Deberás incluir algunos datos que simulen los datos reales de la aplicación de la lista de tareas por hacer.
 c) Agrega las capturas de pantalla con sus respectivas explicaciones y la liga de tu Snack, y anota tus respuestas en un documento.

5. El propósito de esta actividad es leer los datos de la aplicación Node.js del inciso anterior. Al finalizar esta actividad, la aplicación debería ser funcional.
 a) Ejecuta la aplicación Node.js con el túnel.
 b) Agrega la lógica a la aplicación Expo para realizar una petición fetch de tipo GET con la dirección del túnel.
 c) Modifica la aplicación Expo para mostrar el listado de tareas por hacer en el componente "FlatList".
 d) Al hacer clic en el botón, se deberán realizar dos peticiones fetch: una para agregar la tarea y otra para leer el listado de tareas por hacer.
 e) Agrega las capturas de pantalla con sus respectivas explicaciones y la liga de tu Snack, y anota tus respuestas en un documento.
*/



/* 
2.
Explicación de estados HTTP más comunes:
- 200 OK: Solicitud exitosa estándar
- 201 Created: Recurso creado exitosamente (típicamente usado después de POST)
- 400 Bad Request: Error en la solicitud del cliente
- 401 Unauthorized: Autenticación requerida o fallida
- 403 Forbidden: Servidor entiende la solicitud pero la rechaza
- 404 Not Found: Recurso solicitado no encontrado
- 500 Internal Server Error: Error del servidor

Un estado HTTP 201 significa que la solicitud ha sido exitosa y ha resultado en la creación de un recurso. 
Es comúnmente usado después de operaciones POST para indicar que un nuevo recurso ha sido creado correctamente.
*/
