const Post = require('../models/Post');
const Comment = require('../models/Comment');

module.exports.addPost = async (req, res) =>{
    let postId = req.params.id;
    let content = req.body.content;

    try {
        if(content.length < 2){
            req.flash('error', 'Съдържанието на коментара не може да е по-малко от два символа!')
            res.redirect('/blog/post/details/' + postId)
            return;
        }

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
    catch (err){
        req.flash('error', 'Вазникна грешка, моля опитайте пак!')
        res.redirect('/blog/post/details/' + postId)
    }
}

module.exports.removeComment = async (req, res) =>{
    let postId = req.params.postId

    try {
        let id = req.params.id;
        await Comment.findByIdAndDelete(id);

        let post = await Post.findById(postId);
        let index = post.comments.indexOf(id);
        if(index !== -1){
            post.comments.splice(index, 1);
            await post.save();
        }
    }catch (e) {
        req.flash('error', 'Вазникна грешка, моля опитайте пак!')
        res.redirect('/blog/post/details/' + postId)
    }
}