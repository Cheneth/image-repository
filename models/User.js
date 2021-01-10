const mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String

    }
})

UserSchema.pre('save', function (next) {
    var user = this;
    if (! user.isModified('password')) 
        return next();
    // if the password has been changed, we need to re-hash it
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) 
            return next(err);
        
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) 
                return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
})

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) 
            return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.methods.generateAndUpdateAccessToken = async function (username) {
    var user = this;
    const token = jwt.sign({
        id: username
    }, process.env.TOKEN_SECRET, {expiresIn: "1 day"});
    console.log("new token: " + token)
    user.token = token;
    await user.save()
    return token;
}

const User = mongoose.model("User", UserSchema)
module.exports = User
