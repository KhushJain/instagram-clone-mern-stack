const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { User, validate } = require('../models/user');


router.post('/signup', async (req, res) => {

    const { name, email, password, profilePhoto } = req.body;
    const { error } = validate({ name, email, password });
    if (error) {
        return res.json({ error: error.details[0].message });
    }    

    let user = await User.findOne({ email: email })
    if(user) {
        return res.json({ error: "User already registered" });
    }

    hashedPassword = await bcrypt.hash(password, 12);
    user = new User({ name, email, password: hashedPassword, profilePhoto });
    await user.save()

    res.json({ message: "Account Created!" });
    
});


router.post('/signin', async (req, res) => {

    const { error } = validateSignIn(req.body);
    if (error) {
        return res.json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.json({ error: 'Invalid email!' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.json({ error: 'Invalid password!' });
    }

    const token = user.generateAuthToken();
    const { _id, name, followers, following, profilePhoto } = user;
    res.json({ token: token, user: { _id, name, email, followers, following, profilePhoto }, message: 'Signed In Successfully!' });

});


const validateSignIn = (req) => {
    const schema = {
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
    };
    return Joi.validate(req, schema);
}


module.exports = router;