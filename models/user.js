const mongoose = require('mongoose');
const Joi = require('joi'); // For validating the data
const { JWT_SECRET } = require('../config/keys');
const jwt = require('jsonwebtoken');
const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    resetToken: String,
    expireToken: Date,
    followers: [{
        type: ObjectId,
        ref: 'User'
    }],
    following: [{
        type: ObjectId,
        ref: 'User'
    }],
    profilePhoto: {
        type: String,
        default: "https://res.cloudinary.com/khush/image/upload/v1594273772/2_jcukwd.png"
    }
}, {
    timestamps: true
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, JWT_SECRET);
    return token;
};

const User = mongoose.model('User', userSchema);

const validateInput = (user) => {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
    };
    return Joi.validate(user, schema);
}

module.exports.User = User;
module.exports.validate = validateInput;