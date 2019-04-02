const mongoose = require('mongoose');

let notificationSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId},
    content: {type: String}
})

let Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;