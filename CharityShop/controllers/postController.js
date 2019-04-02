const Post = require('../models/Post');
const Comment = require('../models/Comment');
const PostCategory = require('../models/PostCategory');
const postUtils = require('../utilities/postUtils')
let errorMessage = 'Error occurred! Please try again!!'

module.exports.addGet = async (req, res) => {
    let categories = await PostCategory.find();
    res.render('blog/post/add', {categories: categories});
}

module.exports.addPost = async (req, res) => {
    let body = req.body;
    let title = body.title;
    let content = body.content;
    let categoryId = body.category;

    if (!title || !content || !categoryId) {
        let categories = await PostCategory.find();
        let error = 'All fields are required!';
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
    req.flash('info', 'New post was created successfully!')
    res.redirect('/blog/index');
}

module.exports.getAll = async (req, res) => {
    try {
        let posts = await Post.find()
            .sort({creationDate: -1})
            .populate('author')
            .populate('category');

        postUtils.normalizePosts(req, posts);
        let categories = await PostCategory.find();
        categories.unshift({_id: '', name: ''})

        res.render('blog/index', {posts: posts, categories: categories});
    } catch (e) {
        req.flash('error', errorMessage);
        res.redirect('/')
    }
}

module.exports.mostLiked = async (req, res) => {
    let posts = await Post.find()
        .sort({likesCount: -1})
        .populate('author')
        .populate('category');

    postUtils.normalizePosts(req, posts);
    let categories = await PostCategory.find();
    categories.unshift({_id: '', name: ''})

    res.render('blog/index', {posts: posts, categories: categories});
}

module.exports.likePost = async (req, res) => {
    let id = req.params.id;

    try {
        let post = await Post.findById(id);

        if (!post.likes.map(l => l.toString())
            .includes(req.user._id.toString())) {
            post.likes.push(req.user._id);
            post.likesCount++;
        }

        post.save();
        res.redirect('/blog/post/all')
    } catch (e) {
        req.flash('error', errorMessage);
        res.redirect('/blog/post/details/' + id)
    }
}

module.exports.dislikePost = async (req, res) => {
    let id = req.params.id;

    try {
        let post = await Post.findById(id);

        let index = post.likes.indexOf(req.user._id);
        if (index > -1) {
            post.likes.splice(index, 1);
            post.likesCount--;
        }
        post.save();
        res.redirect('/blog/post/all')
    }
    catch (e) {
        req.flash('error', errorMessage);
        res.redirect('/blog/post/details/' + id)
    }
}

module.exports.getPostDetails = async (req, res) => {
    try {
        let id = req.params.id;
        let post = await Post.findById(id)
            .populate('author')
            .populate('category')
            .populate({
                path: 'comments',
                populate: {path: 'author'},
                options: {sort: {creationDate: -1}}
            })

        post.date = post.creationDate.toDateString();
        post.creator = post.author.firstName + ' ' + post.author.lastName;
        post.likesCount = post.likes.length;
        postUtils.checkPostIsLiked(req, post);
        post.userComments = [];
        post.isCreator = req.user != null && post.author._id.toString() === req.user._id.toString();

        for (const comment of post.comments) {
            let isAuthor = req.user != null && comment.author._id.toString() === req.user._id.toString();

            post.userComments.push({
                content: comment.content,
                authorName: comment.author.firstName + ' ' + comment.author.lastName,
                isAuthor: isAuthor,
                id: comment.id
            })
        }

        res.render('blog/post/details', post)
    } catch (e) {
        req.flash('error', errorMessage);
        res.redirect('/blog/post/all')
    }
}

module.exports.editGet = async (req, res) => {
    let id = req.params.id;
    try {
        let post = await Post.findById(id);
        let categories = await getCategoriesAndFindSelctedCategory(post);
        res.render('blog/post/edit', {post, categories})
    } catch (e) {
        req.flash('error', errorMessage);
        res.redirect('/blog/post/details/' + id)
    }
}

module.exports.editPost = async (req, res) => {
    let id = req.params.id;
    let body = req.body;
    try {
        let post = await Post.findById(id);

        if (!body.title || !body.content || !body.category) {
            post.title = body.title;
            post.content = body.content;
            post.categoty = body.category;
            let error = "All fields are required!";
            let categories = await getCategoriesAndFindSelctedCategory(post);
            res.render('blog/post/edit', {post, categories, error: error})
        }

        post.title = body.title;
        post.content = body.content;
        post.category = body.category;
        await post.save();

        req.flash('info', 'The post was edited successfully!')
        res.redirect('/blog/post/details/' + post._id);
    } catch (e) {
        req.flash('error', errorMessage);
        res.redirect('/blog/post/edit/' + id)
    }
}

module.exports.deleteGet = async (req, res) => {
    let id = req.params.id;
    try {
        let post = await Post.findById(id);
        let categories = await getCategoriesAndFindSelctedCategory(post);

        res.render('blog/post/delete', {post, categories})
    } catch (e) {
        req.flash('error', errorMessage);
        res.redirect('/blog/post/details/' + id)
    }
}

module.exports.deletePost = async (req, res) => {
    let id = req.params.id;
    try {
        await Post.findByIdAndRemove(id);
        await Comment.remove({post: id})

        req.flash('info', 'The post was deleted successfully!')
        res.redirect('/blog/post/all');
    } catch (e) {
        req.flash('error', errorMessage);
        res.redirect('/blog/post/details/' + id)
    }
}

async function getCategoriesAndFindSelctedCategory(post) {
    let categories = await PostCategory.find();
    for (const category of categories) {
        if (category._id.toString() === post.category.toString()) {
            category.isSelected = true;
        }
        else {
            category.isSelected = false;
        }
    }

    return categories;
}



