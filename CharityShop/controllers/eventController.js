const Event = require('../models/Event')

module.exports.addGet = (req, res) => {
    res.render('event/add')
}

module.exports.addPost = (req, res) => {
    let event = req.body
    let file = req.file

    if (!file || !file.path) {
        console.log('not image attached')
        res.redirect('/event/edit/' + id)
        return
    }

    event.image = '\\' + req.file.path
    Event.create(event).then(() => {
        res.redirect('/')
    }).catch(err => {
        console.log(err.message)
    })
}

module.exports.deleteGet = (req, res) => {
    let id = req.params.id

    Event.findById(id).then(event => {
        let date = event.date.toDateString();
        event.formatedDate = date;
        res.render('event/delete', event)
    }).catch(err => {
        console.log(err.message)
    })
}

module.exports.deletePost = (req, res) => {
    let id = req.params.id

    Event.findByIdAndDelete(id).then(() => {
        res.redirect('/')
    }).catch(err => {
        console.log(err.message)
    })

}

module.exports.editGet = (req, res) => {
    let id = req.params.id

    Event.findById(id).then(event => {
        res.render('event/edit', event)
    }).catch(err => {
        console.log(err.message)
    })
}

module.exports.editPost = (req, res) => {
    let id = req.params.id
    let event = req.body
    let file = req.file

    if (!file || !file.path) {
        console.log('not image attached')
        res.redirect('/event/edit/' + id)
        return
    }

    event.image = '\\' + req.file.path
    Event.findByIdAndUpdate(id, event).then(() => {
        res.redirect('/')
    }).catch((err) => {
        console.log(err.message)
    })
}

module.exports.getDetails = (req, res) => {
    let id = req.params.id;

    Event.findById(id).then(event => {
        event.occupiedPlaces = event.users.length
        event.time = event.date.toDateString()
        if (req.user) {
            for (const userId of event.users) {
                if(userId.toString() === req.user.id.toString()){
                    event.currentUserIsRegistered = true
                }
            }
        }else{
            event.currentUserIsRegistered = false
        }
        res.render('event/details', event)
    })
}

module.exports.getAllEvents = (req, res) => {
    let startDate = Date.now();
    Event.find({"date": {"$gte": startDate}}).then(events => {
        res.render('event/all', {events: events})
    }).catch((err) => {
        console.log(err.message)
    })
}

module.exports.registerForEvent = (req, res) => {
    let userId = req.user.id;
    let eventId = req.params.id;

    Event.findById(eventId).then(event => {
        if (event.users.includes(userId.toString())) {
            console.log('the user already is registered for this event')
            res.redirect('/event/details/' + eventId)
            return
        }

        event.users.push(userId)
        event.save().then(() => {
            res.redirect('/event/details/' + eventId)
        }).catch(err => {
            console.log(err.message)
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
            console.log(err.message)
        })
    })
}