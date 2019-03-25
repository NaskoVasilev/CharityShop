const Product = require('../models/Product')
const Category = require('../models/Category')
const Cause = require('../models/Cause')
const entityHelper = require('../utilities/entityHelper')
let noChosenFileError = 'Трябва да добавите снимка!';
let errorMessage = 'Възникна грешка! Моля опитайте пак!';

module.exports.addGet = (req, res) => {
    let categoriesPromise = Category.find();
    let causesPromise = Cause.find().select('name')
    Promise.all([categoriesPromise, causesPromise])
        .then(([categories, causes]) => {
            res.render('product/add', {categories: categories, causes: causes})
        }).catch(err => {
        res.redirect('/');
    });
}

module.exports.addPost = (req, res) => {
    let productObj = req.body;
    productObj.creator = req.user._id;

    if (!req.file || !req.file.path) {
        res.render('product/add', {error: noChosenFileError})
        return;
    }

    entityHelper.addBinaryFileToEntity(req, productObj);

    Product.create(productObj)
        .then(product => {
            req.user.createdProducts.push(product._id)
            req.user.save()
            Category.findById(product.category)
                .then(category => {
                    category.products.push(product._id)
                    category.save()
                }).catch(err => {
                res.render('product/add', {error: errorMessage})
                return
            })
            res.redirect('/')
        }).catch(err => {
        res.render('product/add', {error: errorMessage})
    })
}

module.exports.editGet = (req, res) => {
    let id = req.params.id
    let productPromise = Product.findById(id)
    let categoriesPromise = Category.find()

    Promise.all([productPromise, categoriesPromise])
        .then(([product, categories]) => {
            if (!categories || !product) {
                res.redirect('/')
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
                    res.redirect('/')
                    return
                }

                // if (!req.file || !req.file.path) {
                //     res.render('product/add', {error: noChosenFileError})
                //     return;
                // }

                product.name = editedProduct.name
                product.description = editedProduct.description
                product.price = editedProduct.price

                if(req.file && req.file.path){
                    entityHelper.addBinaryFileToEntity(req, product)
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
                                res.redirect('/')
                                return
                            })
                        })
                } else {
                    product.save().then(() => {
                        res.redirect('/')
                    })
                }
            }
            redirectToIndex(res)
            return

        }).catch(err => {
        res.render('product/add', {error: errorMessage})
    })
}

module.exports.deleteGet = (req, res) => {
    let id = req.params.id
    Product.findById(id)
        .then((product) => {
            entityHelper.addImageToEntity(product)
            if (isAuthorOrAdmin(req, product)) {
                if (!product) {
                    res.redirect('/');
                    return
                }
                res.render('product/delete', {product: product})
            } else {
                redirectToIndex(res)
            }
        }).catch(err => {
        res.redirect('/');
    })
}

module.exports.deletePost = (req, res) => {
    let id = req.params.id
    Product.findById(id)
        .then(product => {
            if (isAuthorOrAdmin(req, product)) {
                Category.findById(product.category)
                    .then(category => {
                        let productIndex = category.products.indexOf(product._id)
                        category.products.splice(productIndex, 1)
                        category.save()
                        let index = req.user.createdProducts.indexOf(product._id)
                        if (index >= 0) {
                            req.user.createdProducts.splice(index, 1)
                            req.user.save()
                        }
                        product.remove()
                            .then(() => {
                                res.redirect('/')
                            })
                    })
            }
        });

    res.redirect('/');
}

module.exports.buyGet = (req, res) => {
    let id = req.params.id;
    Product.findById(id).populate('cause')
        .then((product) => {
            entityHelper.addImageToEntity(product)
            if (!product) {
                res.redirect('/');
                return
            }
            if (req.user && product.creator === req.user._id) {
                console.log("The creator of the product cannot buy it")
                res.redirect('/products');
                return;
            }
            res.render('product/buy', {product: product})
        }).catch(() =>{
            res.redirect('/');
    })
}

module.exports.buyPost = async (req, res) => {
    let productId = req.params.id

    let product = await Product.findById(productId).populate('cause');
    if (product.buyer) {
        console.log('The product has been already bought')
        return;
    }

    product.buyer = req.user.id;
    product.cause.raised += product.price;

    if(product.cause.raised >= product.cause.goal){
        product.cause.isCompleted = true;
        await product.cause.save();
    }

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
            entityHelper.addImagesToEntities(products);
            res.render('product/products', {products: products, categories: categories})
        })
}

module.exports.getProductDetails = (req, res) => {
    let productId = req.params.id;

    Product.findById(productId)
        .then(product => {
            entityHelper.addImageToEntity(product);
            if (req.user) {
                product.isAuthorOrAdmin = isAuthorOrAdmin(req, product);
            }

            res.render('product/details', {product: product})
        }).catch(() =>{
            res.redirect('/');
    })
}

module.exports.search = async (req, res) => {
    let productName = req.body.productName;
    let category = req.body.category;
    let products = [];

    let categories = await Category.find();
    categories.unshift({_id: '', name: ''})

    if (category) {
        products = await Product.find({category: category})
    }
    else if (productName) {
        products = await Product.find();
        products = products.filter(x => x.name.toLowerCase()
            .includes(productName.toLowerCase()))
    }


    if (category && productName) {
        products = products.filter(x => x.name.toLowerCase()
            .includes(productName.toLowerCase()))
    }
    entityHelper.addImagesToEntities(products);
    res.render('product/products', {products: products, categories: categories})

}

function isAuthorOrAdmin(req, product) {
    return product.creator.equals(req.user._id)
        || req.user.roles.indexOf('Admin') >= 0
}

function redirectToIndex(res) {
    let error = `error=${encodeURIComponent('Не сте собственик на продукта!')}`
    res.redirect(`/?${error}`)
}

