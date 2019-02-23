const Cause = require('../models/Cause')
const fs = require('fs')
const path = require('path')

module.exports.addGet = (req, res) => {
    res.render('cause/add')
}

module.exports.addPost = (req, res) => {
    let cause = req.body
    cause.image = '\\' + req.file.path

    Cause.create(cause).then(() => {
        res.redirect('/')
    }).catch((err) => {
        console.log(err)
    })
}

module.exports.getAllCauses = (req, res) => {
    Cause.find({isCompleted: false}).sort({_id: -1}).then((causes) => {
        res.render('cause/all', {causes: causes})
    })
}
module.exports.getCompletedCauses = (req, res) => {
    Cause.find({isCompleted: true}).sort({_id: -1}).then((causes) => {
        res.render('cause/completed', {causes: causes})
    })
}

module.exports.deleteGet = (req, res) => {
    let id = req.params.id

    Cause.findById(id).then(cause => {
        res.render('cause/delete', {cause: cause})
    }).catch(err => {
        console.log(err.message)
    })
}
module.exports.deletePost = (req, res) => {
    let id = req.params.id

    Cause.findByIdAndDelete(id).then(()=>{
        res.redirect('/')
    }).catch(err=>{
        console.log(err.message)
    })
}

module.exports.editGet = (req, res) => {
    let id = req.params.id

    Cause.findById(id).then(cause => {
        res.render('cause/edit', {cause: cause})
    }).catch(err => {
        console.log(err.message)
    })
}

module.exports.editPost = (req, res) => {
    let id = req.params.id
    let body = req.body
    let file = req.file

    if(!file || !file.path){
        console.log('not image attached')
        res.redirect('/cause/edit/' + id)
        return
    }

    body.image = '\\' + req.file.path
    Cause.findByIdAndUpdate(id, body).then(()=>{
        res.redirect('/')
    }).catch(err=>{
        console.log(err.message)
    })
}

