const Post = require('../models/Post');
const PostCategory = require('../models/PostCategory');
const postUtils = require('../utilities/postUtils')

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
    res.redirect('/blog/index');
}

module.exports.getAll = async (req, res) => {
    let posts = await Post.find()
        .sort({creationDate: -1})
        .populate('author')
        .populate('category');

    postUtils.normalizePosts(req, posts);
    let categories = await PostCategory.find();
    categories.unshift({_id: '', name: ''})

    res.render('blog/index', {posts: posts, categories: categories});
}

module.exports.mostLiked = async (req, res) => {
    let posts = await Post.find()
        .sort({likes: -1})
        .populate('author')
        .populate('category');

    postUtils.normalizePosts(req, posts);
    let categories = await PostCategory.find();
    categories.unshift({_id: '', name: ''})

    res.render('blog/index', {posts: posts, categories: categories});
}

module.exports.likePost = async (req, res) => {
    let id = req.params.id;
    let post = await Post.findById(id);

    if(!post.likes.map(l => l.toString())
        .includes(req.user._id.toString())){
        post.likes.push(req.user._id);
    }

    post.save();
    res.redirect('/blog/post/all')
}

module.exports.dislikePost = async (req, res) => {
    let id = req.params.id;
    let post = await Post.findById(id);

    let index = post.likes.indexOf(req.user._id);
    if (index > -1) {
        post.likes.splice(index, 1);
    }
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
    post.likesCount = post.likes.length;
    postUtils.checkPostIsLiked(req, post);
    post.userComments = [];

    for (const comment of post.comments) {
        let isAuthor = req.user != null && comment.author._id.toString() === req.user._id.toString();

        post.userComments.push({
            content: comment.content,
            authorName: comment.author.firstName + ' ' + comment.author.lastName,
            isAuthor: isAuthor,
            id: comment.id
        })
    }

    res.render('blog/post/details' , post)
}