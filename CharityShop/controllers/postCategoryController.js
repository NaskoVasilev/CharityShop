const PostCategory = require('../models/PostCategory');

module.exports.addGet = (req, res) => {
    res.render('blog/category/add')
}

module.exports.addPost = (req, res) => {
    let body = req.body;

    if (!body.name) {
        req.flash('error', 'Името на категорията е задължително!')
        res.redirect('/blog/category/add')
        return;
    }

    let category = {
        name: body.name
    }
    PostCategory.create(category)
        .then(() => {
            req.flash('info', `Категория "${body.name}" беше успешно създадена!`)
            res.redirect('/')
        }).catch(err => {
        req.flash('error', 'Възникна грешка, моля опитайте пак!')
        res.redirect('/blog/category/add')
    });
}

module.exports.getAll = async (req, res) => {
    let postCategories = await PostCategory.find({});
    res.render('blog/category/all', {postCategories: postCategories});
}

module.exports.editGet = async (req, res) => {
    let id = req.params.id;

    try {
        let category = await PostCategory.findById(id);
        res.render('blog/category/edit', {postCategory: category});
    } catch (err) {
        req.flash('error', 'Възникна грешка, моля опитайте пак!')
        res.redirect('/blog/category/all')
    }
}

module.exports.editPost = async (req, res) => {
    let id = req.params.id;
    let body = req.body;

    if (!body.name) {
        req.flash('error', 'Името на категорията е задължително!')
        res.redirect('/blog/category/edit/' + id);
        return;
    }

    try {
        let category = await PostCategory.findById(id);
        category.name = body.name;
        await category.save();
        req.flash('info', `Категория "${body.name}" беше успешно редактирана!`)
        res.redirect('/blog/category/all');
    } catch (err) {
        req.flash('error', 'Възникна грешка, моля опитайте пак!')
        res.redirect('/blog/category/edit/' + id)
    }
}