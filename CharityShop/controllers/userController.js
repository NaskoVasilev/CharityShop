const User = require('../models/User')
const Product = require('../models/Product')
const encryption = require('../utilities/encryption')
const entityHelper = require('../utilities/entityHelper')

module.exports.registerGet = (req, res) => {
    res.render('user/register')
}

module.exports.registerPost = (req, res) => {
    let user = req.body
    console.log(user)

    if (user.verificationCode === ""
        || user.generatedCode === ""
        || user.verificationCode !== user.generatedCode) {
        req.flash('error', 'Кодът за потвърждаване на имейла Ви е грешен!')
        res.redirect('/user/register')
        return
    }


    if (!user.email) {
        req.flash('error', 'Email адреса е задължителен!')
        res.redirect('/user/register')
        return
    }

    if (user.password && user.password !== user.confirmedPassword) {
        req.flash('error', 'Паролите трябва да съвпадат!')
        res.redirect('/user/register')
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
                    res.render('user/register', {error: 'Не успяхте да влезнете моля опитайте пак!'})
                    return
                }
                req.flash('info', 'Успешно се регистрирахте!')
                res.redirect('/')
            })
        }).catch(err => {
        let error = 'Вече има потребител със същото потребителско име или email адрес!'
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
                res.render('user/login', {error: 'Вашата парола или потербителско име са грешни!'})
            } else {
                req.logIn(user, (error, user) => {
                    if (error) {
                        res.render('user/login', {error: 'Вашата парола или потербителско име са грешни!'})
                        return
                    }

                    req.flash('info', 'Успешено влезнахте в системата!');
                    res.redirect('/')
                })
            }
        })
}

module.exports.logout = (req, res) => {
    req.logout()
    req.flash('info', 'Успешно излезнахте от системата!');
    res.redirect('/')
}

module.exports.getMyProducts = (req, res) => {
    User.findOne({_id: req.user._id}).populate('createdProducts')
        .then(user => {
            entityHelper.addImagesToEntities(user.createdProducts)
            res.render('user/myProducts', {products: user.createdProducts})
        })
}

module.exports.getBoughtProducts = (req, res) => {
    User.findOne({_id: req.user._id}).populate('boughtProducts')
        .then(user => {
            entityHelper.addImagesToEntities(user.boughtProducts)
            res.render('user/boughtProducts', {products: user.boughtProducts})
        })
}

module.exports.getUserProductDetails = (req, res) => {
    let productId = req.params.id;

    Product.findById(productId)
        .then(product => {
            entityHelper.addImageToEntity(product);
            res.render('user/myProductDetails', {product: product})
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

    let users = await User.find({
        username: username,
        firstName: firstName,
        lastName: lastName
    });

    if (users.length === 0 || users.length > 1) {
        let error = 'Невалидно име, фамилия или потребителско име!';
        res.render('user/addAdmin', {error: error});
    }
    user = users[0];
    user.roles.push('Admin');
    await user.save();

    let message = `${user.username} успешно беше направен администратор!`;
    req.flash('info', message);
    res.redirect('/');
}

module.exports.sendVerificationEmail = (req, res) => {
    let number = Math.random();
    let code = Math.floor(number * 10000);

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

    smtpTrans.sendMail(mailOptions, function (error, res) {
        if (error) {
            res.json('Error')
            return;
        }
    });

    res.json(code);
}