const Category = require('../models/Category')

module.exports.addGet = (req, res) => {
    res.render('category/add')
}

module.exports.addPost = (req, res) => {
    let categoryObj = req.body
    categoryObj.creator = req.user._id
    Category.create(categoryObj)
        .then((category) => {
            req.user.createdCategories.push(category._id)
            req.user.save()
                .then(() => {
                    res.redirect('/')
                })
        })
}

module.exports.productsByCategory = (req, res) => {
    let categoryName = req.params.category

    Category.findOne({ name: categoryName })
        .populate('products')
        .then((category) => {
            if (!category) {
                res.sendStatus(404)
            }
            res.render('category/products', { category: category })
        })
}

module.exports.getAllCategories = (req, res) =>{
    Category.find()
        .then(categories => {
            res.render('category/allCategories', {categories : categories})
        })
}

module.exports.editGet = (req, res) => {
    let id = req.params.id;

    Category.findById(id)
        .then(category => {
            res.render('category/edit', {category : category})
        })
}

module.exports.editPost = (req, res) => {
    let id = req.params.id;
    let editedProduct = req.body;

    Category.findById(id)
        .then(category => {
            category.name = editedProduct.name;
            category.save()
                .then(() => res.redirect('/category/all'))
        })
}