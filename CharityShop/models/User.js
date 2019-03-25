const mongoose = require('mongoose')
const encryption = require('../utilities/encryption')
const propertyIsRequired = '{0} is required.'

let userSchema = mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.String,
        required: propertyIsRequired.replace('{0}', 'Username'),
        unique: true
    },
    email: {
        type: mongoose.Schema.Types.String,
        required: propertyIsRequired.replace('{0}', 'Email'),
        unique: true
    },
    password: {
        type: mongoose.Schema.Types.String,
        required: propertyIsRequired.replace('{0}', 'Password')
    },
    salt: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    firstName: {
        type: mongoose.Schema.Types.String,
        required: propertyIsRequired.replace('{0}', 'First name')
    },
    lastName: {
        type: mongoose.Schema.Types.String,
        required: propertyIsRequired.replace('{0}', 'Last name')
    },
    age: {
        type: mongoose.Schema.Types.Number,
        min: [0, 'Age must be between 0 and 120'],
        max: [120, 'Age must be between 0 and 120']
    },
    roles: [{ type: mongoose.Schema.Types.String }],
    boughtProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    createdProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    createdCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
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
                email: 'admin@admin.abv.bg',
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
                email: 'admin@admin.yahoo.com',
                roles: ['Admin']
            }).then(()=>{
                console.log('Admin user created!')   
            }).catch(err=>{
                console.log(err)   
            })
        }
    })
}

