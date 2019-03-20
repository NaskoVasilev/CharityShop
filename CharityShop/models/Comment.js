const mongoose = require('mongoose')

let commentSchema = mongoose.Schema({
    content: {type: mongoose.Schema.Types.String, required: true},
    creationDate: {type: mongoose.Schema.Types.Date, default: Date.now },
    post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

module.exports = mongoose.model('Comment', commentSchema)