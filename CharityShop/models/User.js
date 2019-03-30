const mongoose = require('mongoose')
const encryption = require('../utilities/encryption')
const propertyIsRequired = 'Полето {0} е задължително.'

let userSchema = mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.String,
        required: propertyIsRequired.replace('{0}', 'Потребителско име'),
        unique: true
    },
    email: {
        type: mongoose.Schema.Types.String,
        required: propertyIsRequired.replace('{0}', 'Email'),
        unique: true
    },
    password: {
        type: mongoose.Schema.Types.String,
        required: propertyIsRequired.replace('{0}', 'Парола')
    },
    salt: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    firstName: {
        type: mongoose.Schema.Types.String,
        required: propertyIsRequired.replace('{0}', 'Име')
    },
    lastName: {
        type: mongoose.Schema.Types.String,
        required: propertyIsRequired.replace('{0}', 'Фамилия')
    },
    age: {
        type: mongoose.Schema.Types.Number,
        min: [10, 'Годините трябва да са от 10 до 90'],
        max: [90, 'Годините трябва да са от 10 до 90']
    },
    roles: [{ type: mongoose.Schema.Types.String }],
    boughtProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    createdProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
})

userSchema.method({
    authenticate: function (password) {
        let hashedPassword = encryption.generateHashedPassword(this.salt, password)

        if (hashedPassword === this.password) {
            return true
        }

        return false
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User

module.exports.seedAdminUser = () => {
    User.find({ username: 'admin' }).then(users => {
        if (users.length === 0) {
            let salt = encryption.generateSalt()
            let hashedPass = encryption.generateHashedPassword(salt, 'admin')
            User.create({
                username: 'admin',
                firstName: 'Atanas',
                lastName: 'Vasilev',
                salt: salt,
                password: hashedPass,
                age: 17,
                email: 'charityShopAppJS@gmail.com',
                roles: ['Admin']
            }).then(()=>{
                console.log('Admin user created!')   
            }).catch(err=>{
                console.log(err)   
            })
        }
    })
	
	User.find({ username: 'naskoAdmin' }).then(users => {
        if (users.length === 0) {
            let salt = encryption.generateSalt()
            let hashedPass = encryption.generateHashedPassword(salt, 'naskoAdmin')
            User.create({
                username: 'naskoAdmin',
                firstName: 'Atanas',
                lastName: 'Vasilev',
                salt: salt,
                password: hashedPass,
                age: 17,
                email: 'naskoAdmin@gmail.com',
                roles: ['Admin']
            }).then(()=>{
                console.log('Admin user created!')   
            }).catch(err=>{
                console.log(err)   
            })
        }
    })
}

