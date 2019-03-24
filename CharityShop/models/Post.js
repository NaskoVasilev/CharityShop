const mongoose = require('mongoose')

let postSchema = mongoose.Schema({
    title: {type: mongoose.Schema.Types.String, required: true},
    content: {type: mongoose.Schema.Types.String},
    likesCount: {type: mongoose.Schema.Types.Number, default: 0},
    likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', default: []}],
    creationDate: {type: mongoose.Schema.Types.Date, default: Date.now },
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default:[]}],
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'PostCategory'}
})

module.exports = mongoose.model('Post', postSchema)