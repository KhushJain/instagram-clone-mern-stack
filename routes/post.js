const router = require('express').Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model('Post');
const User = mongoose.model('User');


router.get('/allpost', requireLogin, (req, res) => {
    Post.find()
        .populate('postedBy', '_id name profilePhoto')
        .populate('comments.postedBy', '_id name')
        .sort('-createdAt')
        .then(posts => {
            res.json({ posts: posts });
        })
        .catch(e => {
            console.error(e);
        });
});


router.get('/getsubscribedposts', requireLogin, (req, res) => {
    Post.find({ postedBy: {$in: req.user.following} })
        .populate('postedBy', '_id name profilePhoto')
        .populate('comments.postedBy', '_id name')
        .sort('-createdAt')
        .then(posts => {
            res.json({ posts: posts });
        })
        .catch(e => {
            console.error(e);
        });
});


router.post('/createpost', requireLogin, (req, res) => {
    const { title, body, picUrl } = req.body;
    if (!title || !body || !picUrl) {
        return res.json({ error: 'Please add all the fields!' });
    }
    const post = new Post({ title, body, photo: picUrl, postedBy: req.user });
    post.save()
        .then(post => {
            res.json({ post: post, message: "Image Uploaded Successfully!" });
        })
        .catch(e => {
            console.log(e);
        });
});


router.get('/mypost', requireLogin, (req, res) => {
    Post.find({ postedBy: req.user._id })
        .populate('postedBy', '_id name profilePhoto')
        .then(myposts => {
            res.json({ myposts: myposts });
        })
        .catch(e => {
            console.error(e);
        });
});


router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push: {likes: req.user._id}
    }, {
        new: true
    })
    .populate('postedBy', '_id name profilePhoto')
    .populate('comments.postedBy', '_id name')
    .exec((err, result) => {
        if (err) {
            return res.json({error: err});
        }
        res.json(result);
    })
});


router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: {likes: req.user._id}
    }, {
        new: true
    })
    .populate('postedBy', '_id name profilePhoto')
    .populate('comments.postedBy', '_id name')
    .exec((err, result) => {
        if (err) {
            return res.json({error: err});
        }
        res.json(result);
    })
});


router.put('/comment', requireLogin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    };
    Post.findByIdAndUpdate(req.body.postId, {
        $push: {comments: comment}
    }, {
        new: true
    })
    .populate('comments.postedBy', '_id name')
    .populate('postedBy', '_id name profilePhoto')
    .exec((err, result) => {
        if (err) {
            return res.json({error: err});
        }
        res.json(result);
    })
});


router.delete('/deletepost/:postId', requireLogin, (req, res) => {
    Post.findOne({_id: req.params.postId})
    .populate("postedBy", "_id")
    .exec((err, post) => {
        if (err || !post) {
            return res.json({ error: err });
        }
        if (post.postedBy._id.toString() === req.user._id.toString()) {
            post.remove()
            .then(result => {
                res.json({ result, message: 'Successfully deleted!' })
            })
            .catch(e => {
                console.log(e);
            });
        }
    })
});


router.delete('/deletecomment/:postId/:commentId', requireLogin, (req, res) => {
    Post.findOne({_id: req.params.postId})
    .populate("postedBy", "_id")
    .populate('comments.postedBy', '_id name')
    .exec((err, post) => {
        if (err || !post) {
            return res.json({ error: err });
        }
        post.comments = post.comments.filter(item => {
            if (!(item.postedBy._id.toString() === req.user._id.toString() && item._id.toString() === req.params.commentId.toString())) {
                return item
            }
        })
        post.save()
        .then(result => {
            Post.findOne({_id: result.id})
            .populate('postedBy', '_id name profilePhoto')
            .populate('comments.postedBy', '_id name')
            .exec((e, post) => {
                if (err || !post) {
                    return res.json({ error: err });
                }
                res.json({ result: post, message: 'Successfully deleted comment!' });
            })
        })
        .catch(e => {
            console.log(e);
        })
        
    })
});


router.post('/likedusers', requireLogin, (req, res) => {
    Post.findById( req.body.postId )
        .populate('postedBy', '_id name email')
        .then(post => {
            User.find({ _id: {$in: post.likes} })
                .select('_id name email')
                .then(users => {
                    res.json({ users })
                })
        })
        .catch(e => {
            console.error(e);
        });
});


router.get('/post/:postid', requireLogin, (req, res) => {
    Post.findOne({ _id: req.params.postid })
    .populate('postedBy', '_id name profilePhoto')
    .populate('comments.postedBy', '_id name')
    .then(post => {
        res.json({ post: post });
    })
    .catch(e => {
        console.error(e);
    });
});


module.exports = router;