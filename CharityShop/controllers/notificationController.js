const Notification = require('../models/Notifications');
const User = require('../models/User');

module.exports.notifyUserGet = async(req, res) =>{
    let usernames = await User.find().select('username');

    res.render('admin/notifyUser', {usernames:usernames});
}

module.exports.notifyUserPost = async(req, res) =>{
   try {
       let body = req.body;

       let users = await User.find({username: body.username});

       if(users.length === 0 || users.length > 1){
           body.error = 'There is no user with this username!';
           res.render('admin/notifyUser', body);
           return;
       }

       let user = users[0];

       let notification = {
           userId: user.id,
           content: body.message + ` - from ${req.user.firstName} ${req.user.lastName}`
       }

       await Notification.create(notification);
       req.flash('info', `The notification was sent to ${user.firstName} ${user.lastName}!`)
       res.redirect('/')
   }catch (err){
       let errorMessage = 'Error occurred! Please try again!';
       req.flash('error', errorMessage);
       res.redirect('/')
   }
}

module.exports.getAll = async (req, res) => {
    try {
        let notifications = await Notification.find({userId: req.user.id});
        res.render('user/notification', {notifications: notifications})
    }catch (e) {
        let errorMessage = 'Error occurred! Please try again!';
        req.flash('error', errorMessage);
        res.redirect('/')
    }
}

module.exports.deleteNotification = async(req, res) =>{
    let id = req.params.id;
    
    try {
        await Notification.findByIdAndDelete(id);
        res.redirect('/user/notification/all')
    }catch (e) {
        let errorMessage = 'Error occurred! Please try again!';
        req.flash('error', errorMessage);
        res.redirect('/')
    }
    
}