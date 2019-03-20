const mongoose = require('mongoose')

let postCategorySchema = mongoose.Schema({
    name: {type: mongoose.Schema.Types.String, required: true},
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post', default:[]}],
})

module.exports = mongoose.model('PostCategory', postCategorySchema)