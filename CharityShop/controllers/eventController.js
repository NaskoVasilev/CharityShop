const Event = require('../models/Event')
const entityHelper = require('../utilities/entityHelper')
let noChosenFileError = 'Please choose a photo!';
let errorMessage = 'Error occurred! Please try again!';

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

        event.error = "The event's date cannot be in the past!";
        res.render('event/add', event)
        return;
    }

    Event.create(event).then(() => {
        req.flash('info', 'New event was created successfully!')
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
        req.flash('info', 'The event was deleted successfully!!')
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
        message = "The event's name is required!"
    }
    else if (event.placesCount <= 0) {
        message = "The event's places should be positive number!"
    }
    else if (!event.address) {
        message = "The event's address is required!"
    }
    else if (!event.town) {
        message = "The event's town is required!"
    }

    if (message) {
        event.error = message;
        res.render('event/edit', event);
        return;
    }

    if (new Date(event.date) < Date.now()) {
        event.error = "The event's date cannot be in the past!";
        res.render('event/edit', event);
        return;
    }

    if (req.file && req.file.path) {
        entityHelper.addBinaryFileToEntity(req, event);
    }

    Event.findByIdAndUpdate(id, event).then(() => {
        req.flash('info', 'The event was edited successfully!');
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
            req.flash('error', 'No more free places for this event!');
            res.redirect('/event/details/' + eventId)
            return
        }

        event.users.push(userId)
        event.save().then(() => {
            req.flash('info', 'Successfully registered for the event!');
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
            req.flash('error', 'You are not registered for this event!');
            res.redirect('event/details/' + eventId)
            return
        }

        event.users.splice(index, 1)
        event.save().then(() => {
            req.flash('info', 'Successfully unregistered from this event!');
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
        body.error = 'All fields are required!';
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
        subject: 'Information about the upcoming event ' + event.name,
        html: html
    };

    let successfullySent = true;
    smtpTrans.sendMail(mailOptions, function (error) {
        if (error) {
            successfullySent = false;
        }
    });

    if(!successfullySent){
        req.flash('error', 'Error occurred. Please try again!');
        res.redirect('/event/details/' + id);
        return;
    }

    req.flash('info', 'Emails were successfully sent to all registered users for this event!')
    res.redirect('/event/details/' + id)
}