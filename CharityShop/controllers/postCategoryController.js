const PostCategory = require('../models/PostCategory');

module.exports.addGet = (req, res) => {
    res.render('blog/category/add')
}

module.exports.addPost = (req, res) => {
    let body = req.body;

    if (body.name) {
        console.log('Name is required!')
        res.redirect('/')
    }

    let category = {
        name: body.name
    }
    PostCategory.create(category)
        .then(() => {
            res.redirect('/')
        });
}

module.exports.getAll = async (req, res) => {
    let postCategories = await PostCategory.find({});
    res.render('blog/category/all', {postCategories: postCategories});
}

module.exports.editGet = async (req, res) => {
    let id = req.params.id;

    let category = await PostCategory.findById(id);
    res.render('blog/category/edit', {postCategory: category});
}

module.exports.editPost = async (req, res) => {
    let id = req.params.id;
    let body = req.body;

    if (!body.name) {
        console.log('Name is required');
        res.render('/');
    }

    let category = await PostCategory.findById(id);
    category.name = body.name;
    await category.save();
    res.redirect('/blog/category/all');
}