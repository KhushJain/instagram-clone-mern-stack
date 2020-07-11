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


router.post('/searchusers', requireLogin, (req, res) => {
    let userPattern = new RegExp("^" + req.body.query);
    User.find({ email: {$regex: userPattern } })
        .select("_id name email")
        .then(users => {
            res.json({ users });
        })
        .catch(e => {
            console.log(e);
        })
});


router.delete('/deleteaccount', requireLogin, (req, res) => {
    let userId = req.user._id
    User.findById(userId)
        .then(user => {
            user.followers.map(followersId => {
                    User.findByIdAndUpdate(followersId, {
                        $pull: { following: userId }
                    }, {
                        new: true
                    }, (err, result) => {
                        if (err) {
                            return res.json({ error: err });
                        }
                    })
            });
            user.following.map(followingId => {
                User.findByIdAndUpdate(followingId, {
                    $pull: { followers: userId }
                }, {
                    new: true
                }, (err, result) => {
                    if (err) {
                        return res.json({ error: err });
                    }
                })
        })
        })

    Post.find({ "comments.postedBy": userId })
        .then(posts => {
            posts.map(post => {
                post.comments = post.comments.filter(item => item.postedBy.toString() !== userId.toString());
                let index = post.likes.indexOf(userId)
                if (index !== -1 ) post.likes.splice(index, 1);
                post.save()
                    .catch(e => {
                        console.log(e);
                    });
            });
        })
        .catch(e => {
            console.log(e);
        })

    Post.find({ likes: userId })
        .then(posts => {
            posts.map(post => {
                post.likes.splice(post.likes.indexOf(userId), 1);
                post.save()
                    .catch(e => {
                        console.log(e);
                    });
            });
        })
        .catch(e => {
            console.log(e);
        })  

    User.deleteOne({ _id: userId }, (err, result) => {
        if (err) {
            return res.json({ error: err });
        }
        Post.deleteMany({ postedBy: userId }, (err, result) => {
            if (err) {
                return res.json({ error: err });
            }
            res.json({ message: 'Account deleted!' });
        })
    })
});


module.exports = router;