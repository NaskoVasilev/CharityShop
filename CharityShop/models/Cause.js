const mongoose = require('mongoose')

let causeSchema = mongoose.Schema({
    name: { type: mongoose.Schema.Types.String, required: true },
    description: { type: mongoose.Schema.Types.String },
    raised: {
        type: mongoose.Schema.Types.Number,
        min: 0, default: 0
    },
    goal: {type: mongoose.Schema.Types.Number, min: 0},
    image: { data: mongoose.Schema.Types.Buffer, contentType: String },
    isCompleted: {type: mongoose.Schema.Types.Boolean, default: false}
})

module.exports = mongoose.model('Cause', causeSchema)