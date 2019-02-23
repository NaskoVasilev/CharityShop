const fs = require('fs')
const path = require('path')
const Product = require('../models/Product')
const Cause = require('../models/Cause')
const Event = require('../models/Event')

module.exports.index = (req, res) => {

    let causePromise = Cause.find({isCompleted: false})
        .sort([['_id', -1]]).limit(3);
    let eventPromise = Event.find().sort([['_id', -1]]).limit(4)

    Promise.all([causePromise, eventPromise]).then((values)=>{
        let causes = values[0]
        let events = values[1]
        res.render('home/index', {causes:causes, events:events})
    })
    // let queryData = req.query
    // Product.find({buyer:null}).populate('category')
    //     .then((products) => {
    //         if (queryData.query) {
    //             products = products.filter(p => p.name.toLowerCase().includes(queryData.query.toLowerCase()))
    //         }
    //
    //         let data = { products: products }
    //         if (req.query.error) {
    //             data.error = req.query.error
    //         } else if (req.query.success) {
    //             data.success = req.query.success
    //         }
    //         res.render('home/index', data)
    //     })
}

