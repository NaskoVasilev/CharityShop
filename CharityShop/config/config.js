const path = require('path')

module.exports = {
    environment: 'production',
    development: {
        url: 'http://localhost:8000',
        connectionString: 'mongodb://localhost:27017/ShopDatabase',
        rootPath: path.normalize(path.join(__dirname, '../'))
    },
    production: {
        url: 'https://charity-shop.herokuapp.com',
        connectionString: 'production database connection string comes here',
        rootPath: path.normalize(path.join(__dirname, '../'))
    },
    email: {
        username: 'charityShopAppJS@gmail.com',
        password: 'email password comes here',
        service: 'gmail'
    }
}