const path = require('path')

module.exports = {
    environment: process.env.NODE_environment || 'development',
    development: {
        url: 'http://localhost:8000',
        // connectionString:'mongodb://nasko:nasko-js-24112001@ds253959.mlab.com:53959/charity-shop',
        connectionString: 'mongodb://localhost:27017/ShopDatabase',
        rootPath: path.normalize(path.join(__dirname, '../'))
    },
    production: {
        url: 'https://charity-shop.herokuapp.com/',
        connectionString: 'mongodb://nasko:nasko-js-24112001@ds253959.mlab.com:53959/charity-shop',
        rootPath: path.normalize(path.join(__dirname, '../'))
    },
    email: {
        username: 'charityShopAppJS@gmail.com',
        password: 'charity-js-app-secret',
        service: 'gmail'
    }
}