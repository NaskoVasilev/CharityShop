const Event = require('../models/Event')
const entityHelper = require('../utilities/entityHelper')
let noChosenFileError = 'Трябва да изберете снимка!';
let errorMessage = 'Възникна грешка! Моля опитайте пак!';

module.exports.addGet = (req, res) => {
    res.render('event/add')
}

module.exports.addPost = (req, res) => {
    let event = req.body

    if (!req.file || !req.file.path) {
        res.render('event/add', {error: noChosenFileError})
        return;
    }

    entityHelper.addBinaryFileToEntity(req, event);

    if (new Date(event.date) < Date.now()) {
        res.render('event/add', {error: "Дата на събитието не може да бъде в миналото!"})
        return;
    }

    Event.create(event).then(() => {
        res.redirect('/')
    }).catch(err => {
        res.render('event/add', {error: errorMessage})
    })
}

module.exports.deleteGet = (req, res) => {
    let id = req.params.id

    Event.findById(id).then(event => {
        let date = event.date.toDateString();
        event.formatedDate = date;
        res.render('event/delete', event)
    }).catch(err => {
        res.redirect('/');
    })
}

module.exports.deletePost = (req, res) => {
    let id = req.params.id

    Event.findByIdAndDelete(id).then(() => {
        res.redirect('/')
    }).catch(err => {
        res.redirect('/');
    })

}

module.exports.editGet = (req, res) => {
    let id = req.params.id

    Event.findById(id).then(event => {
        res.render('event/edit', event)
    }).catch(err => {
        res.redirect('/');
    })
}

module.exports.editPost = (req, res) => {
    let id = req.params.id
    let event = req.body

    if (new Date(event.date) < Date.now()) {
        event.error = "Дата на събитието не може да бъде в миналото!";
        res.render('event/edit', event);
        return;
    }

    if (req.file && req.file.path) {
        entityHelper.addBinaryFileToEntity(req, event);
    }

    Event.findByIdAndUpdate(id, event).then(() => {
        res.redirect('/')
    }).catch((err) => {
        res.redirect('/');
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
        res.redirect('/')
    })
}

module.exports.getAllEvents = (req, res) => {
    let startDate = Date.now();
    Event.find({"date": {"$gte": startDate}}).then(events => {
        entityHelper.addImagesToEntities(events);
        res.render('event/all', {events: events})
    }).catch((err) => {
        res.redirect('/');
    })
}

module.exports.registerForEvent = (req, res) => {
    let userId = req.user.id;
    let eventId = req.params.id;

    Event.findById(eventId).then(event => {
        if (event.placesCount <= event.users.length ||
            event.users.includes(userId.toString())) {
            res.redirect('/event/details/' + eventId)
            return
        }

        event.users.push(userId)
        event.save().then(() => {
            res.redirect('/event/details/' + eventId)
        }).catch(err => {
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
            console.log('the user is not registered')
            res.redirect('event/details/' + eventId)
            return
        }

        event.users.splice(index, 1)
        event.save().then(() => {
            res.redirect('/event/details/' + eventId)
        }).catch(err => {
            res.redirect('/event/details/' + eventId)
        })
    })
}

module.exports.getRegisteredUsers = async (req, res) => {
    let id = req.params.id;

    let event = await Event.findById(id)
        .populate('users');

    res.render('event/registeredUsers', {users: event.users});
}

module.exports.renderEmailForm = (req, res) => {
    res.render('event/emailForm');
}

module.exports.sendEmails = async (req, res) => {
    let id = req.params.id;
    let event = await Event.findById(id);

    const environment = process.env.NODE_environment || 'development'
    let url = require('../config/config.js')[environment].url;
    const eventDetailsUrl = url + '/event/details/' + id;
    let body = req.body;
    body.address = event.address;
    body.town = event.town;
    body.description = event.description;
    body.date = event.date;
    body.eventDetailsUrl = eventDetailsUrl;

    let html = require('../utilities/emailTemplates.js').getEventEmail(body);

    let emailSender = require('../utilities/emailSender.js');
    let smtpTrans = emailSender.setEmailSender();
    let mailOptions = {
        to: 'nasko01vasilev@gmail.com',
        subject: 'Информазия за предстоящото събитие ' + event.name,
        html: html
    };

    smtpTrans.sendMail(mailOptions, function (error, res) {
        if (error) {
            req.flash('error', 'Възникна грешка!');
            res.redirect('/event/details/' + id)
            return;
        }
    });

    req.flash('info', 'Успешно бяха изпратени имейли на всички регистрирани потребители!')
    res.redirect('/event/details/' + id)
}