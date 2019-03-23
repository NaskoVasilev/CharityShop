const mongoose = require('mongoose')

let postCategorySchema = mongoose.Schema({
    name: {type: mongoose.Schema.Types.String, required: true},
})

module.exports = mongoose.model('PostCategory', postCategorySchema)