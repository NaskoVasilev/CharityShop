const Product = require('../models/Product')
const Category = require('../models/Category')
const fs = require('fs')
const path = require('path')

module.exports.addGet = (req, res) => {
    Category.find()
        .then((categories) => {
            res.render('product/add', {categories: categories})
        })
}

module.exports.addPost = (req, res) => {
    let productObj = req.body
    productObj.image = '\\' + req.file.path
    productObj.creator = req.user._id

    Product.create(productObj)
        .then(product => {
            req.user.createdProducts.push(product._id)
            req.user.save()
            Category.findById(product.category)
                .then(category => {
                    category.products.push(product._id)
                    category.save()
                }).catch(err => {
                console.log(err)
                return
            })
            res.redirect('/')
        }).catch(err => {
        console.log(err)
    })
}

module.exports.editGet = (req, res) => {
    let id = req.params.id
    let productPromise = Product.findById(id)
    let categoriesPromise = Category.find()

    Promise.all([productPromise, categoriesPromise])
        .then(([product, categories]) => {
            if (!categories || !product) {
                res.statusCode(404)
                return
            }
            if (isAuthorOrAdmin(req, product)) {
                res.render('product/edit', {product: product, categories: categories})
            }
            else {
                redirectToIndex(res)
            }
        })
}

module.exports.editPost = (req, res) => {
    let id = req.params.id
    let editedProduct = req.body

    Product.findById(id)
        .then(product => {
            if (isAuthorOrAdmin(req, product)) {
                if (!product) {
                    res.redirect(`/?error=${encodeURIComponent('error=Product was not found!')}`)
                    return
                }

                product.name = editedProduct.name
                product.description = editedProduct.description
                product.price = editedProduct.price

                if (req.file) {
                    product.image = '\\' + req.file.path
                }

                if (product.category.toString() !== editedProduct.category) {
                    let oldCategoryPromise = Category.findById(product.category.toString())
                    let newCategoryPromise = Category.findById(editedProduct.category)

                    Promise.all([oldCategoryPromise, newCategoryPromise])
                        .then(([oldCategory, newCategory]) => {
                            let index = oldCategory.products.indexOf(product._id)
                            if (index >= 0) {
                                oldCategory.products.splice(index, 1)
                                oldCategory.save()
                            }

                            newCategory.products.push(product._id)
                            newCategory.save()

                            product.category = editedProduct.category
                            product.save().then(() => {
                                console.log('Saving')
                                res.redirect('/?success=' + encodeURIComponent('Successfuly edited product!'))
                                return
                            })
                        })
                } else {
                    product.save().then(() => {
                        res.redirect('/?success=' + encodeURIComponent('Successfuly edited product!'))
                    })
                }
            }
            redirectToIndex(res)
            return

        }).catch(err => {
        console.log(err)
        return
    })
}

module.exports.deleteGet = (req, res) => {
    let id = req.params.id
    Product.findById(id)
        .then((product) => {
            if (isAuthorOrAdmin(req, product)) {
                if (!product) {
                    res.statusCode(404)
                    return
                }
                res.render('product/delete', {product: product})
            } else {
                redirectToIndex(res)
            }
        })
}

module.exports.deletePost = (req, res) => {
    let id = req.params.id
    Product.findById(id)
        .then(product => {
            if (isAuthorOrAdmin(req, product)) {
                Category.findById(product.category)
                    .then(category => {
                        let index = category.products.indexOf(product._id)
                        category.products.splice(index, 1)
                        category.save()
                        fs.unlink(path.join(__dirname, '..' + product.image), (err) => {
                            if (err) {
                                console.log('Cannot delete image!')
                            }
                            let index = req.user.createdProducts.indexOf(product._id)
                            if (index >= 0) {
                                req.user.createdProducts.splice(index, 1)
                                req.user.save()
                            }
                            product.remove()
                                .then(() => {
                                    res.redirect('/?success=' + encodeURIComponent('Successfuly deleted product!'))
                                })
                        })
                    })
            }
            redirectToIndex(req, product)
            return
        })
}

module.exports.buyGet = (req, res) => {
    let id = req.params.id
    Product.findById(id)
        .then((product) => {
            if (!product) {
                res.statusCode(404)
                return
            }
            res.render('product/buy', {product: product})
        })
}

module.exports.buyPost = (req, res) => {
    let productId = req.params.id

    Product.findById(productId)
        .then(product => {
            if (product.buyer) {
                let error = `error=${encodeURIComponent('Product was already bought!')}`
                res.redirect(`/?${error}`)
                return
            }

            product.buyer = req.user._id
            product.save()
                .then(() => {
                    req.user.boughtProducts.push(productId)
                    req.user.save()
                        .then(() => {
                            res.redirect('/')
                        })
                })
        })
}

module.exports.getAllProducts = (req, res) => {
    Product.find({buyer: {$exists: false}}).sort({$natural: -1}).limit(21)
        .then(products => {
            res.render('product/products', {products: products})
        })
}

module.exports.getProductDetails = (req, res) => {
    let productId = req.params.id;

    Product.findById(productId)
        .then(product => {
            res.render('product/details', {product: product})
        })
}

function isAuthorOrAdmin(req, product) {
    return product.creator.equals(req.user._id)
        || req.user.roles.indexOf('Admin') >= 0
}

function redirectToIndex(res) {
    let error = `error=${encodeURIComponent('You are not creator of the product!')}`
    res.redirect(`/?${error}`)
}

