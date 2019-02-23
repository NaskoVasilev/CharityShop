const homeHandler = require('./home')
const productHandler = require('./product')
const categoryHandler = require('./categoryHandler')
const userController = require('./userController')
const causeController = require('./causeController')
const eventController = require('./eventController')

module.exports = {
    home: homeHandler,
    product: productHandler,
    category: categoryHandler,
    user: userController,
    cause: causeController,
    event: eventController
}