const User = require('../models/User')
const Product = require('../models/Product')
const encryption = require('../utilities/encryption')
const entityHelper = require('../utilities/entityHelper')

module.exports.registerGet = (req, res) => {
    res.render('user/register')
}

module.exports.registerPost = (req, res) => {
    let user = req.body

    if (user.password && user.password !== user.confirmedPassword) {
        user.error = 'Паролите трябва да съвпадат!'
        res.render('user/register', user)
        return
    }

    let salt = encryption.generateSalt()
    user.salt = salt

    if (user.password) {
        let hashedPassword = encryption.generateHashedPassword(salt, user.password)
        user.password = hashedPassword
    }

    User.create(user)
        .then(user => {
            req.logIn(user, (error, user) => {
                if (error) {
                    res.render('user/register', { error: 'Не успяхте да влезнете моля опитайте пак!' })
                    return
                }
                res.redirect('/')
            })
        }).catch(err => {
            user.error = 'Трябва да полълните задължителните полета!'
            res.render('user/register', user)
        })
}

module.exports.loginGet = (req, res) => {
    res.render('user/login')
}

module.exports.loginPost = (req, res) => {
    let userToLogin = req.body

    User.findOne({ username: userToLogin.username })
        .then(user => {
            if (!user || !user.authenticate(userToLogin.password)) {
                res.render('user/login', { error: 'Вашата парола или потербителско име са грешни!' })
            } else {
                req.logIn(user, (error, user) => {
                    if (error) {
                        res.render('user/login', { error: 'Вашата парола или потербителско име са грешни!' })
                        return
                    }
                    res.redirect('/')
                })
            }
        })
}

module.exports.logout = (req, res) => {
    req.logout()
    res.redirect('/')
}

module.exports.getMyProducts = (req, res) => {
    User.findOne({ _id: req.user._id }).populate('createdProducts')
        .then(user => {
            entityHelper.addImagesToEntities(user.createdProducts)
            res.render('user/myProducts', { products: user.createdProducts })
        })
}

module.exports.getBoughtProducts = (req, res) => {
    User.findOne({ _id: req.user._id }).populate('boughtProducts')
        .then(user => {
            entityHelper.addImagesToEntities(user.boughtProducts)
            res.render('user/boughtProducts', { products: user.boughtProducts })
        })
}

module.exports.getUserProductDetails = (req, res) => {
    let productId = req.params.id;

    Product.findById(productId)
        .then(product => {
            entityHelper.addImageToEntity(product);
            res.render('user/myProductDetails', {product:product})
        })
}