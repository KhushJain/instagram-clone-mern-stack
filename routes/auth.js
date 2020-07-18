const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { User, validate } = require('../models/user');
const crypto = require('crypto');
const { SENDGRID_APIKEY, EMAIL, EMAILURL } = require('../config/keys');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');


const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: SENDGRID_APIKEY
    }
}))


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
    user.save()
        .then(savedUser => {
            transporter.sendMail({
                to: user.email,
                from: `${EMAIL}`,
                subject: "Sign up Successful!",
                html: `<h2>Welcome to Worldia, ${user.name}.<h2><h3>We are here to help you connect and share your thoughts with the world!</h3>`
            })

            transporter.sendMail({
                to: `${EMAIL}`,
                from: `${EMAIL}`,
                subject: "Worldia: New User Signed Up",
                html: `<h2>Details:</h2><h3>Name: ${user.name}<br>Email: ${user.email}<h3>`
            })
        
            res.json({ message: "Account Created!" });
        })
        .catch(e => {
            console.log(e);
        })    
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


router.post('/resetpassword', (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) console.log(err)
        const token = buffer.toString("hex")
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) return res.json({ error: 'User does not exist!' });
                user.resetToken = token;
                user.expireToken = Date.now() + 3600000
                user.save()
                    .then(savedUser => {
                        transporter.sendMail({
                            to: user.email,
                            from: `${EMAIL}`,
                            subject: "Reset Password",
                            html: `
                            <h3>Worldia</h3>
                            <p>You have requested for password reset.</p>
                            <h5>Click on this <a href="${EMAILURL}/reset/${token}">link</a> to reset the password</h5>
                            `
                        })
                        res.json({ message: "Check your email!" });
                    })
                    .catch(e => {
                        console.log(e);
                    })
            })
    });
});


router.post('/newpassword', (req, res) => {
    const newPassword = req.body.password;
    const sentToken = req.body.token;
    User.findOne({ resetToken: sentToken, expireToken: {$gt: Date.now()} })
        .then(user => {
            if (!user) return res.json({ error: 'Try again, session expired!' });
            bcrypt.hash(newPassword, 12)
                .then(hashedPassword => {
                    user.password = hashedPassword;
                    user.resetToken = undefined;
                    user.expireToken = undefined;
                    user.save()
                        .then(savedUser => {
                            res.json({ message: "Password Updated Successfully!" });
                        });
                })
        })
        .catch(e => {
            console.log(e);
        })
});


module.exports = router;