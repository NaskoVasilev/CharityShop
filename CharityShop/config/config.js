const path=require('path')

module.exports = {
    development:{
        // connectionString:'mongodb://nasko:nasko-js-24112001@ds253959.mlab.com:53959/charity-shop',
        connectionString:'mongodb://localhost:27017/ShopDatabase',
        rootPath:path.normalize(path.join(__dirname,'../'))
    },
    production:{
        connectionString:'mongodb://nasko:nasko-js-24112001@ds253959.mlab.com:53959/charity-shop',
		rootPath:path.normalize(path.join(__dirname,'../'))
    }
}