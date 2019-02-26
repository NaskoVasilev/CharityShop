const fs = require('fs')
const path = require('path')
const Product = require('../models/Product')
const Cause = require('../models/Cause')
const Event = require('../models/Event')
const entityHelper = require('../utilities/entityHelper')

module.exports.index = (req, res) => {

    let causePromise = Cause.find({isCompleted: false})
        .sort([['_id', -1]]).limit(3);

    let startDate = Date.now();
    let eventPromise = Event.find({"date": {"$gte": startDate}})
        .sort([['_id', -1]]).limit(4)

    Promise.all([causePromise, eventPromise]).then((values) => {
        let causes = values[0]
        let events = values[1]

        entityHelper.addImagesToEntities(causes);
        entityHelper.addImagesToEntities(events);

        res.render('home/index', {causes: causes, events: events})
    })
}

