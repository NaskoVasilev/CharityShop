const mongoose = require('mongoose')

let categorySchema = mongoose.Schema({
    name: { type: mongoose.Schema.Types.String, required: true, unique: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

module.exports = mongoose.model('Category', categorySchema)