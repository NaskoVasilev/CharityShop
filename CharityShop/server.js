const port = 8000
const express = require('express')
const environment = process.env.NODE_environment || 'development'
const config = require('./config/config')
const database = require('./config/database.config')
const app = express()

database(config[environment])
require('./config/express')(app, config[environment])
require('./config/routes')(app)
require('./config/passport')()

app.listen(port, () => { console.log('Listening on port: ' + port) })
