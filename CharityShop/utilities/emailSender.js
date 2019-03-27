function setEmailSender(){
    let email = require('../config/config.js').email;

    let nodemailer = require('nodemailer');
    let smtpTransport = require('nodemailer-smtp-transport');
    let smtpTrans = nodemailer.createTransport(smtpTransport({
        service: email.service,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: email.username,
            pass: email.password
        }
    }));

    return smtpTrans;
}

module.exports = {
    setEmailSender: setEmailSender,
}