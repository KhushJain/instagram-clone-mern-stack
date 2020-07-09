const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');
const mongoose = require('mongoose');
const { User } = require('../models/user');

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.json({ error: 'You must be logged in!' });
    }
    const token = authorization.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET, (e, payload) =>{
        if(e) {
            return res.json({ error: 'Invalid Token!' });
        }
        const { _id } = payload;
        User.findById(_id)
            .select('-password')
            .then(user => {
                req.user = user;
                next();
            });
    });
};