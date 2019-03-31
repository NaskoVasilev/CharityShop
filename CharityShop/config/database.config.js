const mongoose = require('mongoose')
mongoose.Promise = global.Promise

module.exports = function (config) {
    mongoose.connect(config.connectionString)

    let database = mongoose.connection
    database.once('open', (err) => {
        if (err) {
            console.log(err)
            console.log('Connection failed!')
            return
        }
        console.log('Successfully connected!')
    })

    require('../models/Product')
    require('../models/Category')
    require('../models/PostCategory')
    require('../models/User')//.seedAdminUser()
}