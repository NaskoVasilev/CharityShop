const Product = require('../models/Product')
const Category = require('../models/Category')
const Cause = require('../models/Cause')
const fs = require('fs')
const path = require('path')

module.exports.addGet = (req, res) => {
    let categoriesPromise = Category.find();
    let causesPromise = Cause.find().select('name')
    Promise.all([categoriesPromise, causesPromise])
        .then(([categories, causes]) => {
            res.render('product/add', {categories: categories, causes: causes})
        });
}

module.exports.addPost = (req, res) => {
    let productObj = req.body;
    productObj.image = '\\' + req.file.path;
    productObj.creator = req.user._id;

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
    let id = req.params.id;
    Product.findById(id).populate('cause')
        .then((product) => {
            if (!product) {
                res.statusCode(404)
                return
            }
            if(req.user && product.creator === req.user._id){
                console.log("The creator of the product cannot buy it")
                res.redirect('/products');
                return;
            }
            res.render('product/buy', {product: product})
        })
}

module.exports.buyPost = async (req, res) => {
    let productId = req.params.id

    let product = await Product.findById(productId).populate('cause');
    if(product.buyer){
        console.log('The product has been already bought')
        return;
    }

    product.buyer = req.user.id;
    product.cause.raised += product.price;
    await product.save();
    await product.cause.save();

    req.user.boughtProducts.push(product.id)
    req.user.save();

    res.redirect('/products')
}

module.exports.getAllProducts = async (req, res) => {
    let categories = await Category.find();
    categories.unshift({_id: '', name: ''})

    Product.find({buyer: {$exists: false}}).sort({$natural: -1})
        .then(products => {
            res.render('product/products', {products: products, categories: categories})
        })
}

module.exports.getProductDetails = (req, res) => {
    let productId = req.params.id;

    Product.findById(productId)
        .then(product => {
            if(req.user){
                product.isAuthorOrAdmin = isAuthorOrAdmin(req, product);
            }

            res.render('product/details', {product: product})
        })
}

module.exports.search = async (req, res)=>{
    let productName = req.body.productName;
    let category = req.body.category;
    let products = [];
    console.log(productName)
    console.log(category)
    let categories = await Category.find();
    categories.unshift({_id: '', name: ''})

    if(category){
        products = await Product.find({category: category})
    }
    else if(productName){
        products = await Product.find();
        products = products.filter(x => x.name.toLowerCase()
            .includes(productName.toLowerCase()))
    }

    console.log(products)

    if(category && productName){
        products = products.filter(x => x.name.toLowerCase()
            .includes(productName.toLowerCase()))
    }

    res.render('product/products', {products: products, categories: categories})

}

function isAuthorOrAdmin(req, product) {
    return product.creator.equals(req.user._id)
        || req.user.roles.indexOf('Admin') >= 0
}

function redirectToIndex(res) {
    let error = `error=${encodeURIComponent('You are not creator of the product!')}`
    res.redirect(`/?${error}`)
}

