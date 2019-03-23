const User = require('../models/User');
const Post = require('../models/Post');
const PostCategory = require('../models/PostCategory');
const postUtils = require('../utilities/postUtils')

module.exports.renderBlogIndex = async (req, res) => {
    let categories = await PostCategory.find({})
    categories.unshift({_id: '', name: ''});

    let posts = await Post.find()
        .sort({creationDate:-1})
        .limit(12)
        .populate('author')
        .populate('category');

    postUtils.normalizePosts(req, posts)

    res.render('blog/index', {posts: posts, categories: categories});
}

module.exports.search = async (req, res) => {
    let postName = req.body.postName;
    let category = req.body.category;
    let posts = [];

    let categories = await PostCategory.find();
    categories.unshift({_id: '', name: ''})

    if (category) {
        posts = await Post.find({category: category})
            .sort({creationDate: -1})
            .populate('author')
            .populate('category');
    }
    else if (postName) {
        posts = await Post.find()
            .sort({creationDate: -1})
            .populate('author')
            .populate('category');
        posts = posts.filter(x => x.title.toLowerCase()
            .includes(postName.toLowerCase()))
    }

    if (category && postName) {
        posts = posts.filter(x => x.title.toLowerCase()
            .includes(postName.toLowerCase()))
    }

    postUtils.normalizePosts(req, posts)

    res.render('blog/index', {posts: posts, categories: categories})
}