const Product = require('../models/Product')
const Category = require('../models/Category')
const Cause = require('../models/Cause')
const entityHelper = require('../utilities/entityHelper')
let noChosenFileError = 'Please choose a photo!';
let errorMessage = 'Error occurred! Please try again!';

module.exports.addGet = (req, res) => {
    let categoriesPromise = Category.find();
    let causesPromise = Cause.find({isCompleted: false}).select('name')
    Promise.all([categoriesPromise, causesPromise])
        .then(([categories, causes]) => {
            res.render('product/add', {categories: categories, causes: causes})
        }).catch(err => {
        req.flash('error', errorMessage);
        res.redirect('/');
    });
}

module.exports.addPost = async (req, res) => {
    let productObj = req.body;
    productObj.creator = req.user._id;

    let message = entityHelper.validateProduct(productObj);
    if (message) {
        await addCausesAndCategoriesToProduct(productObj);
        productObj.error = message;
        res.render('product/add', productObj)
        return;
    }

    if (!req.file || !req.file.path) {
        await addCausesAndCategoriesToProduct(productObj);
        productObj.error = noChosenFileError;
        res.render('product/add', productObj)
        return;
    }

    entityHelper.addBinaryFileToEntity(req, productObj);

    try {
        let product = await Product.create(productObj)
        req.user.createdProducts.push(product._id);
        await req.user.save();

        let category = await Category.findById(product.category)
        category.products.push(product._id)
        await category.save()

        req.flash('info', 'New product was created successfully!');
        res.redirect('/products');
    } catch (err) {
        await addCausesAndCategoriesToProduct(productObj);
        productObj.error = errorMessage;
        res.render('product/add', productObj)
    }
}

module.exports.editGet = async (req, res) => {
    let id = req.params.id;
    try {
        let productObj = await Product.findById(id);

        if (!isAuthorOrAdmin(req, productObj)) {
            req.flash('error', 'You are no owner of the product!');
            res.redirect('/')
            return;
        }

        await addCausesAndCategoriesToProduct(productObj);
        res.render('product/edit', productObj)
    } catch (e) {
        req.flash('error', errorMessage);
        res.redirect('/product/details/' + id)
    }
}

module.exports.editPost = async (req, res) => {
    let id = req.params.id;
    let editedProduct = req.body;

    let message = entityHelper.validateProduct(editedProduct);
    if (message) {
        await addCausesAndCategoriesToProduct(editedProduct);
        editedProduct.error = message;
        res.render('product/edit', editedProduct)
        return;
    }

    try {
        let product = await Product.findById(id);

        product.name = editedProduct.name
        product.description = editedProduct.description
        product.price = editedProduct.price
        product.cause = editedProduct.cause;

        if (req.file && req.file.path) {
            entityHelper.addBinaryFileToEntity(req, product)
        }

        if (product.category.toString() !== editedProduct.category) {
            let oldCategory = await Category.findById(product.category)
            let newCategory = await Category.findById(editedProduct.category)

            let index = oldCategory.products.indexOf(product._id.toString())
            if (index >= 0) {
                oldCategory.products.splice(index, 1)
                await oldCategory.save()
            }

            newCategory.products.push(product._id)
            await newCategory.save()
            product.category = editedProduct.category
        }

        await product.save();
        req.flash('info', 'The product was edited successfully!!')
        res.redirect('/product/details/' + id);

    } catch (e) {
        await addCausesAndCategoriesToProduct(editedProduct);
        editedProduct.error = errorMessage;
        res.render('product/edit', editedProduct)
    }
}

module.exports.deleteGet = (req, res) => {
    let id = req.params.id;
    Product.findById(id)
        .then((product) => {
            entityHelper.addImageToEntity(product)
            if (isAuthorOrAdmin(req, product)) {
                if (!product) {
                    req.flash('error', errorMessage)
                    res.redirect('/');
                    return
                }
                res.render('product/delete', {product: product})
            } else {
                req.flash('error', 'You are not owner of the product!');
                res.redirect('/')
            }
        }).catch(err => {
        req.flash('error', errorMessage);
        res.redirect('/');
    })
}

module.exports.deletePost = async (req, res) => {
    let id = req.params.id;

    try {
        let product = await Product.findById(id);

        if(isAuthorOrAdmin(req, product)){
            let category = await Category.findById(product.category);
            let productIndex = category.products.indexOf(product._id);

            if(productIndex > -1){
                category.products.splice(productIndex, 1);
                await category.save();
            }

            let index = req.user.createdProducts.indexOf(product._id)
            if (index >= 0) {
                req.user.createdProducts.splice(index, 1)
                await req.user.save()
            }

            await product.remove();

            req.flash('info', 'The product was deleted successfully!');
            res.redirect('/user/myProducts')
        }
        else{
            req.flash('You are not owner of the product!');
            res.redirect('/')
        }
    }catch(err){
        req.flash('error', errorMessage);
        res.redirect('/products')
    }
}

module.exports.buyGet = (req, res) => {
    let id = req.params.id;
    Product.findById(id).populate('cause')
        .then((product) => {
            entityHelper.addImageToEntity(product)
            if (!product) {
                req.flash('error', errorMessage);
                res.redirect('/');
                return
            }
            if (req.user && product.creator.toString() === req.user._id.toString()) {
                req.flash('error', 'You cannot buy your own products!');
                res.redirect('/products');
                return;
            }
            res.render('product/buy', {product: product})
        }).catch(() => {
        req.flash('error', errorMessage);
        res.redirect('/');
    })
}

module.exports.buyPost = async (req, res) => {
    let productId = req.params.id;

    try {
        let product = await Product.findById(productId).populate('cause');
        if (product.buyer) {
            req.flash('error', 'The product has been already bought!');
            res.redirect('/products');
            return;
        }

        product.buyer = req.user.id;
        product.cause.raised += product.price;

        if (product.cause.raised >= product.cause.goal) {
            product.cause.isCompleted = true;
        }

        await product.save();
        await product.cause.save();

        req.user.boughtProducts.push(product.id)
        req.user.save();

        req.flash('info', `You successfully bought ${product.name}!`);
        res.redirect('/products')
    }catch (e) {
        req.flash('error', errorMessage);
        res.redirect('/products')
    }
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
        .populate('category', 'name')
        .populate('cause', 'name')
        .populate('creator', 'firstName lastName')
        .then(product => {
            entityHelper.addImageToEntity(product);
            if (req.user) {
                product.isAuthorOrAdmin = isAuthorOrAdmin(req, product);
            }
            res.render('product/details', {product: product})
        }).catch((err) => {
        req.flash('error', errorMessage);
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
    return product.creator.equals(req.user._id.toString())
        || req.user.roles.indexOf('Admin') >= 0
}

async function addCausesAndCategoriesToProduct(product) {
    let categories = await Category.find();
    let causes = await Cause.find({isCompleted: false});
    entityHelper.addPropertyIsSelectedToCategory(categories, product, 'category');
    entityHelper.addPropertyIsSelectedToCategory(causes, product, 'cause');
    product.categories = categories;
    product.causes = causes;
}