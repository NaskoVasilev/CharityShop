const Category = require('../models/Category')

module.exports.addGet = (req, res) => {
    res.render('category/add')
}

module.exports.addPost = (req, res) => {
    let categoryObj = req.body;
    Category.create(categoryObj)
        .then((category) => {
            let message = `Категория ${category.name} успешно беше създадена!`;
            req.flash('info', message)
            res.redirect('/category/all')
        })
        .catch(err => {
            req.flash('error', "Името на категорията е задължиделно и уникално!")
            res.redirect('/category/add')
        })
}

module.exports.getAllCategories = (req, res) => {
    Category.find()
        .then(categories => {
            res.render('category/allCategories', {categories: categories})
        })
}

module.exports.editGet = (req, res) => {
    let id = req.params.id;

    Category.findById(id)
        .then(category => {
            res.render('category/edit', {category: category})
        })
}

module.exports.editPost = (req, res) => {
    let id = req.params.id;
    let editedProduct = req.body;

    Category.findById(id)
        .then(category => {
            category.name = editedProduct.name;
            category.save()
                .then(() => {
                    let message = `Категория ${category.name} успешно беше редактирана!`;
                    req.flash('info', message)
                    res.redirect('/category/all')
                }).catch(err => {
                req.flash('error', "Името на категорията е задължиделно и уникално!")
                res.redirect('/category/edit/' + category.id)
            })
        })
}