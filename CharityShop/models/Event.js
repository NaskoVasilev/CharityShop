const mongoose = require('mongoose')

let eventSchema = mongoose.Schema({
    name: {type: mongoose.Schema.Types.String, required: true},
    description: {type: mongoose.Schema.Types.String},
    image: { data: mongoose.Schema.Types.Buffer, contentType: String },
    placesCount: {type: mongoose.Schema.Types.Number, min: 0, required: true},
    date: {type: mongoose.Schema.Types.Date},
    address: {type: mongoose.Schema.Types.String, required: true},
    town: {type: mongoose.Schema.Types.String, required: true},
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', default:[]}]
})

module.exports = mongoose.model('Event', eventSchema)