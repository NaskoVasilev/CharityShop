const User = require('../models/User');
const Post = require('../models/Post');
const PostCategory = require('../models/PostCategory');

module.exports.addGet = async (req, res) => {
    let categories = await PostCategory.find();
    res.render('blog/post/add', {categories: categories});
}

module.exports.addPost = async (req, res) => {
    let body = req.body;
    let title = body.title;
    let content = body.content;
    let categoryId = body.category;
    console.log(body);

    if (!title || !content || !categoryId) {
        let categories = await PostCategory.find();
        let error = 'Всички полета са задължителни!';
        res.render('blog/post/add', {categories: categories, post: body, error: error});
        return;
    }

    let post = {
        title: title,
        content: content,
        author: req.user._id,
        category: categoryId
    }
    await Post.create(post);
    res.redirect('/');
}

module.exports.getAll = async (req, res) => {
    let posts = await Post.find()
        .populate('author')
        .populate('category');

    for (const post of posts) {
        post.date = post.creationDate.toDateString();
        post.creator = post.author.firstName + ' ' + post.author.lastName;
        post.content = post.content.substr(0, 200) + '...';
    }

    res.render('blog/post/all', {posts: posts});
}

module.exports.likePost = async (req, res) => {
    let id = req.params.id;
    let post = await Post.findById(id);
    post.likes++;
    post.save();
    res.redirect('/blog/post/all')
}

module.exports.dislikePost = async (req, res) => {
    let id = req.params.id;
    let post = await Post.findById(id);
    post.likes--;
    post.save();
    res.redirect('/blog/post/all')
}

module.exports.getPostDetails = async (req, res) => {
    let id = req.params.id;
    let post = await Post.findById(id)
        .populate('author')
        .populate('category')
        .populate({
            path: 'comments',
            populate: {path: 'author'},
            options: { sort: { creationDate: -1 } }
        })
        .sort({ 'comments.creationDate': 1 })
    post.date = post.creationDate.toDateString();
    post.creator = post.author.firstName + ' ' + post.author.lastName;
    post.userComments = [];

    for (const comment of post.comments) {
        post.userComments.push({
            content: comment.content,
            authorName: comment.author.firstName + ' ' + comment.author.lastName
        })
    }

    res.render('blog/post/details' , post)
}