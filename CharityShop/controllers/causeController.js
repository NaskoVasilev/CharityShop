const Cause = require('../models/Cause');
const Product = require('../models/Product');
const entityHelper = require('../utilities/entityHelper');
let noChosenFileError = 'Трябва да изберете снимка!';
let errorMessage = 'Възникна грешка! Моля опитайте пак!';

module.exports.addGet = (req, res) => {
    res.render('cause/add')
}

module.exports.addPost = (req, res) => {
    let cause = req.body

    if (!req.file || !req.file.path) {
        req.flash('error', noChosenFileError)
        res.redirect('/cause/add')
        return;
    }

    entityHelper.addBinaryFileToEntity(req, cause);

    Cause.create(cause).then(() => {
        req.flash('info', "Каузата беше създадена успешно!")
        res.redirect('/cause/all')
    }).catch((err) => {
        req.flash('error', errorMessage)
        res.redirect('/cause/add')
        return;
    })
}

module.exports.getAllCauses = (req, res) => {
    Cause.find({isCompleted: false})
        .sort({_id: -1}).then((causes) => {
        entityHelper.addImagesToEntities(causes);
        res.render('cause/all', {causes: causes})
    })
}

module.exports.getCompletedCauses = (req, res) => {
    Cause.find({isCompleted: true}).sort({_id: -1}).then((causes) => {
        entityHelper.addImagesToEntities(causes);
        res.render('cause/completed', {causes: causes})
    })
}

module.exports.deleteGet = (req, res) => {
    let id = req.params.id

    Cause.findById(id).then(cause => {
        res.render('cause/delete', {cause: cause})
    }).catch(err => {
        req.flash('error', errorMessage)
        res.redirect('/')
    })
}

module.exports.deletePost = (req, res) => {
    let id = req.params.id

    Cause.findByIdAndDelete(id).then(() => {
        let message = `Каузата беше успешно изтрита!`;
        req.flash('info', message)
        res.redirect('/');
    }).catch(err => {
        req.flash('error', errorMessage)
        res.redirect('/cause/delete/' + id);
    })
}

module.exports.editGet = (req, res) => {
    let id = req.params.id

    Cause.findById(id).then(cause => {
        res.render('cause/edit', {cause: cause})
    }).catch(err => {
        req.flash('error', errorMessage)
        res.redirect('/')
    })
}

module.exports.editPost = (req, res) => {
    let id = req.params.id
    let body = req.body

    if (req.file && req.file.path) {
        entityHelper.addBinaryFileToEntity(req, body);
    }

    let message = null;
    if (!body.name) {
        message = "Името е задължително!"
    }
    else if (body.goal <= 0) {
        message = "Нужните пари трябва да са положително число!"
    }

    if (message) {
        res.render('cause/edit', {cause: body, error: message});
        return;
    }

    Cause.findByIdAndUpdate(id, body).then(() => {
        let message = `Каузата беше успешно редактирана!`;
        req.flash('info', message)
        res.redirect('/cause/all')
    }).catch(err => {
        body.error = errorMessage;
        res.render('cause/edit', {cause: body});
    })
}

module.exports.viewProducts = async (req, res) => {
    let causeId = req.params.id;

    let products = await Product.find({cause: causeId})
    entityHelper.addImagesToEntities(products);
    res.render('product/products', {products: products})
}