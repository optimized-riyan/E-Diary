const mongoose = require('mongoose')
const crypto = require('crypto')

mongoose.set("strictQuery", false)
mongoose.connect('mongodb://127.0.0.1:27017/ediarydb', {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    if (err) throw err
    else {
        console.log('Connected to MongoDB server')
    }
})

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    hashed_password: String,
    salt: String
})
userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hashed_password = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
    console.log(this)
}
userSchema.methods.isValidPassword = function(password) {
    let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
    return this.hashed_password === hash
}
var User = mongoose.model('User', userSchema)

const entrySchema = new mongoose.Schema({
    date: Date,
    content: String,
    username: {
        type: String,
        required: true
    }
})
var Entry = mongoose.model('Entry', entrySchema)

module.exports.Entry = Entry
module.exports.User = User