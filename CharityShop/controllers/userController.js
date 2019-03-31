const User = require('../models/User')
const Product = require('../models/Product')
const encryption = require('../utilities/encryption')
const entityHelper = require('../utilities/entityHelper')

module.exports.registerGet = (req, res) => {
    res.render('user/register')
}

module.exports.registerPost = (req, res) => {
    let user = req.body

    if (user.verificationCode === ""
        || user.generatedCode === ""
        || user.verificationCode !== user.generatedCode) {
        req.flash('error', 'The verification code is wrong!')
        res.redirect('/user/register')
        return
    }


    if (!user.email) {
        req.flash('error', 'The email is required!')
        res.redirect('/user/register')
        return
    }

    if (user.password.length < 5) {
        req.flash('error', 'The password should be at least 5 characters long!')
        res.redirect('/user/register')
        return
    }

    if (user.password && user.password !== user.confirmedPassword) {
        req.flash('error', 'The passwords should match!')
        res.redirect('/user/register')
        return
    }

    let salt = encryption.generateSalt()
    user.salt = salt

    let hashedPassword = encryption.generateHashedPassword(salt, user.password)
    user.password = hashedPassword

    User.create(user)
        .then(user => {
            req.logIn(user, (error, user) => {
                if (error) {
                    res.render('user/register', {error: 'Error occurred! Please try again!!'})
                    return
                }
                req.flash('info', 'Register successfully!')
                res.redirect('/')
            })
        }).catch(err => {
        let error = 'Please use other username or email!'
        req.flash('error', error);
        res.redirect('/user/register')
    })
}

module.exports.loginGet = (req, res) => {
    res.render('user/login')
}

module.exports.loginPost = (req, res) => {
    let userToLogin = req.body

    User.findOne({username: userToLogin.username})
        .then(user => {
            if (!user || !user.authenticate(userToLogin.password)) {
                res.render('user/login', {error: 'Your password or username are wrong!'})
            } else {
                req.logIn(user, (error, user) => {
                    if (error) {
                        res.render('user/login', {error: 'Your password or username are wrong!!'})
                        return
                    }

                    req.flash('info', 'Login successfully!');
                    res.redirect('/')
                })
            }
        })
}

module.exports.logout = (req, res) => {
    req.logout()
    req.flash('info', 'Logout successfully!');
    res.redirect('/')
}

module.exports.getMyProducts = (req, res) => {
    User.findOne({_id: req.user._id}).populate('createdProducts')
        .then(user => {
            entityHelper.addImagesToEntities(user.createdProducts)
            res.render('user/myProducts', {products: user.createdProducts})
        })
        .catch(() => {
            req.flash('error', 'Error occurred! Please try again!')
            res.redirect('/')
        })
}

module.exports.getBoughtProducts = (req, res) => {
    User.findOne({_id: req.user._id}).populate('boughtProducts')
        .then(user => {
            entityHelper.addImagesToEntities(user.boughtProducts)
            res.render('user/boughtProducts', {products: user.boughtProducts})
        })
        .catch(() => {
            req.flash('error', 'Error occurred! Please try again!')
            res.redirect('/')
        })
}

module.exports.getUserProductDetails = (req, res) => {
    let productId = req.params.id;

    Product.findById(productId)
        .populate('category', 'name')
        .populate('cause', 'name')
        .then(product => {
            entityHelper.addImageToEntity(product);
            res.render('user/myProductDetails', {product: product})
        })
        .catch(() => {
            req.flash('error', 'Error occurred! Please try again!')
            res.redirect('/')
        })
}

module.exports.getAddAdminView = (req, res) => {
    res.render('user/addAdmin');
}

module.exports.addAdminPost = async (req, res) => {
    let body = req.body;
    let username = body.username;
    let firstName = body.firstName;
    let lastName = body.lastName;

    try {
        let users = await User.find({
            username: username,
            firstName: firstName,
            lastName: lastName
        });

        if (users.length === 0 || users.length > 1) {
            let error = 'Invalid name, surname or username!';
            res.render('user/addAdmin', {error: error});
            return;
        }

        user = users[0];

        if (user.roles.includes('Admin')) {
            let error = `${user.username} is admin yet`;
            res.render('user/addAdmin', {error: error});
            return;
        }

        user.roles.push('Admin');
        await user.save();

        let message = `${user.username} became administrator successfully!`;
        req.flash('info', message);
        res.redirect('/');
    } catch (err) {
        req.flash('error', 'Error occurred! Please try again!!')
        res.redirect('/')
    }
}

module.exports.removeAdminGet = (req, res) => {
    res.render('user/removeAdmin')
}

module.exports.removeAdminPost = async (req, res) => {
    let body = req.body;
    let username = body.username;
    let firstName = body.firstName;
    let lastName = body.lastName;

    try {
        let users = await User.find({
            username: username,
            firstName: firstName,
            lastName: lastName
        });

        if (users.length === 0 || users.length > 1) {
            let error = 'Invalid name, surname or username!';
            res.render('user/removeAdmin', {error: error});
            return;
        }

        user = users[0];
        let index = user.roles.indexOf('Admin');
        if (index === -1) {
            let error = user.username + ' is not admin!';
            res.render('user/removeAdmin', {error: error});
            return;
        }

        user.roles.splice(index, 1);
        await user.save();

        let message = `${user.username} was removed as administrator successfully!`;
        req.flash('info', message);
        res.redirect('/');
    } catch (err) {
        req.flash('error', 'Error occurred! Please try again!')
        res.redirect('/')
    }
}

module.exports.sendVerificationEmail = (req, res) => {
    let number = Math.random();
    let code = Math.floor(number * 100000);

    let email = req.body.email;
    let pattern = /(\W|^)[\w.+\-]*@gmail\.com(\W|$)/ig;
    let result = email.match(pattern);
    if (result === null) {
        res.json('Error')
        return;
    }

    let html = require('../utilities/emailTemplates').getVerificationEmail(code);

    let emailSender = require('../utilities/emailSender.js');
    let smtpTrans = emailSender.setEmailSender();
    let mailOptions = {
        to: email,
        subject: 'Код за потвърждавене не емейл адрес!',
        html: html
    };

    let sendEmailSuccessfully = true;
    smtpTrans.sendMail(mailOptions, function (error) {
        if (error) {
            sendEmailSuccessfully = false;
        }
    });

    if (!sendEmailSuccessfully) {
        req.flash('error', 'Error occurred! Please try again!!')
        res.redirect('/user/register');
        return;
    }

    res.json(code);
}