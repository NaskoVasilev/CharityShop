const mongoose = require('mongoose')

let productSchema = mongoose.Schema({
    name: { type: mongoose.Schema.Types.String, required: true },
    description: { type: mongoose.Schema.Types.String },
    price: {
        type: mongoose.Schema.Types.Number,
        min: 0,
        max: Number.MAX_VALUE,
        default: 0
    },
    image: { data: mongoose.Schema.Types.Buffer, contentType: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cause: { type: mongoose.Schema.Types.ObjectId, ref: 'Cause', required: true }
})

module.exports = mongoose.model('Product', productSchema)