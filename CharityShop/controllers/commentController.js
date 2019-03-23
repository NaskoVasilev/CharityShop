const Post = require('../models/Post');
const Comment = require('../models/Comment');

module.exports.addPost = async (req, res) =>{
    let postId = req.params.id;
    let content = req.body.content;

    let post = await Post.findById(postId);

    let comment = {
        content: content,
        post: post.id,
        author: req.user.id
    }

    let result = await Comment.create(comment)
    post.comments.push(result.id);
    await post.save();
    res.redirect('/blog/post/details/' + postId);
}

module.exports.removeComment = async (req, res) =>{
    let id = req.params.id;
    await Comment.findByIdAndDelete(id);
}