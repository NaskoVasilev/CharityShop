const Event = require('../models/Event')
const entityHelper = require('../utilities/entityHelper')
let noChosenFileError = 'Трябва да изберете снимка!';
let errorMessage = 'Възникна грешка! Моля опитайте пак!';

module.exports.addGet = (req, res) => {
    res.render('event/add')
}

module.exports.addPost = (req, res) => {
    let event = req.body;

    if (!req.file || !req.file.path) {
        event.error = noChosenFileError;
        res.render('event/add', event);
        return;
    }

    entityHelper.addBinaryFileToEntity(req, event);

    if (new Date(event.date) < Date.now()) {

        event.error = "Дата на събитието не може да бъде в миналото!";
        res.render('event/add', event)
        return;
    }

    Event.create(event).then(() => {
        req.flash('info', 'Ново събитие беше създадено успешно!')
        res.redirect('/event/all');
    }).catch(err => {
        event.error = errorMessage;
        res.render('event/add', event);
    })
}

module.exports.deleteGet = (req, res) => {
    let id = req.params.id

    Event.findById(id).then(event => {
        let date = event.date.toDateString();
        event.formatedDate = date;
        res.render('event/delete', event)
    }).catch(err => {
        req.flash('error', errorMessage)
        res.redirect('/');
    })
}

module.exports.deletePost = (req, res) => {
    let id = req.params.id

    Event.findByIdAndDelete(id).then(() => {
        req.flash('info', 'Събитието беше изтрито успешно!')
        res.redirect('/event/all')
    }).catch(err => {
        req.flash('error', errorMessage);
        res.redirect('/event/delete/' + id);
    })
}

module.exports.editGet = (req, res) => {
    let id = req.params.id

    Event.findById(id).then(event => {
        res.render('event/edit', event)
    }).catch(err => {
        req.flash('error', errorMessage);
        res.redirect('/');
    })
}

module.exports.editPost = (req, res) => {
    let id = req.params.id;
    let event = req.body;

    let message = null;
    if (!event.name) {
        message = "Името на събитието е задължително!"
    }
    else if (event.placesCount <= 0) {
        message = "Местата на събитието трябва да бъде положително число!"
    }
    else if (!event.address) {
        message = "Адреса на събитието е задължително!"
    }
    else if (!event.town) {
        message = "Града на събитието е задължително!"
    }

    if (message) {
        event.error = message;
        res.render('event/edit', event);
        return;
    }

    if (new Date(event.date) < Date.now()) {
        event.error = "Дата на събитието не може да бъде в миналото!";
        res.render('event/edit', event);
        return;
    }

    if (req.file && req.file.path) {
        entityHelper.addBinaryFileToEntity(req, event);
    }

    Event.findByIdAndUpdate(id, event).then(() => {
        req.flash('info', 'Събитието беше редактирано успешно!');
        res.redirect('/event/details/' + id);
    }).catch((err) => {
        event.error = errorMessage
        res.render('event/edit', event);
    })
}

module.exports.getDetails = (req, res) => {
    let id = req.params.id;

    Event.findById(id)
        .then(event => {
            event.occupiedPlaces = event.users.length
            event.time = event.date.toDateString()
            entityHelper.addImageToEntity(event);
            if (req.user) {
                for (const userId of event.users) {
                    if (userId.toString() === req.user.id.toString()) {
                        event.currentUserIsRegistered = true
                    }
                }
            } else {
                event.currentUserIsRegistered = false
            }
            res.render('event/details', event)
        }).catch(err => {
        req.flash('error', errorMessage);
        res.redirect('/')
    })
}

module.exports.getAllEvents = (req, res) => {
    let startDate = Date.now();
    Event.find({"date": {"$gte": startDate}}).then(events => {
        entityHelper.addImagesToEntities(events);
        res.render('event/all', {events: events})
    }).catch((err) => {
        req.flash('error', errorMessage);
        res.redirect('/')
    })
}

module.exports.registerForEvent = (req, res) => {
    let userId = req.user.id;
    let eventId = req.params.id;

    Event.findById(eventId).then(event => {
        if (event.placesCount <= event.users.length ||
            event.users.includes(userId.toString())) {
            req.flash('error', 'Няма повече свободни места за това събитие!');
            res.redirect('/event/details/' + eventId)
            return
        }

        event.users.push(userId)
        event.save().then(() => {
            req.flash('info', 'Успешно се регистрирахте за събитието!');
            res.redirect('/event/details/' + eventId)
        }).catch(err => {
            req.flash('error', errorMessage);
            res.redirect('/event/details/' + eventId)
        })
    })
}

module.exports.unregisterFromEvent = (req, res) => {
    let eventId = req.params.id;
    let userId = req.user.id;

    Event.findById(eventId).then(event => {
        let index = event.users.indexOf(userId)

        if (index === -1) {
            req.flash('error', 'Не сте регистрирани за това събитие!');
            res.redirect('event/details/' + eventId)
            return
        }

        event.users.splice(index, 1)
        event.save().then(() => {
            req.flash('info', 'Успешно се отписахте от събитието!');
            res.redirect('/event/details/' + eventId)
        }).catch(err => {
            req.flash('error', errorMessage);
            res.redirect('/event/details/' + eventId)
        })
    })
}

module.exports.getRegisteredUsers = async (req, res) => {
    let id = req.params.id;

    try {
        let event = await Event.findById(id)
            .populate('users');
        res.render('event/registeredUsers', {users: event.users});
    } catch (e) {
        req.flash('error', errorMessage);
        res.redirect('/event/details/' + id);
    }
}

module.exports.renderEmailForm = (req, res) => {
    res.render('event/emailForm');
}

module.exports.sendEmails = async (req, res) => {
    let id = req.params.id;
    let event;
    try {
        event = await Event.findById(id)
            .populate('users', 'email');
    }catch(err){
        req.flash('error', errorMessage);
        res.redirect('/event/details/' + id);
        return;
    }

    const environment = require('../config/config.js').environment;
    let url = require('../config/config.js')[environment].url;
    const eventDetailsUrl = url + '/event/details/' + id;
    let body = req.body;

    if(!body.title || !body.content){
        body.error = 'Всички полета са задължитени!';
        res.render(`event/emailForm`, body);
        return;
    }

    body.address = event.address;
    body.town = event.town;
    body.description = event.description;
    body.date = event.date;
    body.eventDetailsUrl = eventDetailsUrl;

    let html = require('../utilities/emailTemplates.js').getEventEmail(body);
    let userEmails = event.users.map(u => u.email).join(', ');
    let emailSender = require('../utilities/emailSender.js');
    let smtpTrans = emailSender.setEmailSender();
    let mailOptions = {
        to: userEmails,
        subject: 'Информазия за предстоящото събитие ' + event.name,
        html: html
    };

    let successfullySent = true;
    smtpTrans.sendMail(mailOptions, function (error) {
        if (error) {
            successfullySent = false;
        }
    });

    if(!successfullySent){
        req.flash('error', 'Възникна грешка!');
        res.redirect('/event/details/' + id);
        return;
    }

    req.flash('info', 'Успешно бяха изпратени имейли на всички регистрирани потребители!')
    res.redirect('/event/details/' + id)
}