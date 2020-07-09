const router = require('express').Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model('Post');
const User = mongoose.model('User');


router.get('/user/:id', requireLogin, (req, res) => {
    User.findOne({ _id: req.params.id })
        .select('-password')
        .then(user => {
            Post.find({ postedBy: req.params.id })
            .populate("postedBy", "_id name")
            .exec((err, posts) => {
                if (err) {
                    return res.json({ error: err });
                }
                res.json({ user, posts })
            })
        })
        .catch(err => {
            return res.json({ error: "User not found" });
        })
});


router.put('/follow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.followid, {
        $push: { followers: req.user._id }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            return res.json({ error: err });
        }
        User.findByIdAndUpdate(req.user._id, {
            $push: { following: req.body.followid }
        }, {
            new: true
        })
        .select("-password")
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            return res.json({ error: err });
        })
    })
});


router.put('/unfollow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.unfollowid, {
        $pull: { followers: req.user._id }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            return res.json({ error: err });
        }
        User.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.body.unfollowid }
        }, {
            new: true
        })
        .select("-password")
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            return res.json({ error: err });
        })
    })
});


router.put('/updateprofilephoto', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id , {
        $set: { profilePhoto: req.body.profilePhoto }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            return res.json({ error: err });
        }
        res.json(result);
    })
});


module.exports = router;