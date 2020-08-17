const express       = require('express');
const app           = express();
const router        = express.Router({mergeParams: true});
const Campground    = require('../models/campground');
const Comment       = require('../models/comment');
// const methodOverride    = require('method-override');

// PASSING LOGGED IN USER DATA TO ALL TEMPLATES
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// MIDDLEWARE TO CHECK IF USER IS LOGGED IN
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// MIDDLEWARE TO CHECK IF CAMPGROUND BELONGS TO USER
const checkCommentOwnership = async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const comment = await Comment.findById(req.params.comment_id);
            if (comment.author.id.equals(req.user._id)) {
                next();
            } else {
                console.log('you cant do that.');
                res.redirect('back');
            }
        } else {
            console.log('you cant do that.');
            res.redirect('back');
        }
    } catch (error) {
        console.log('you cant do that.');
        res.redirect('next');
    }
}

// NEW ROUTE
router.get('/new', isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
        } else {
            // console.log(campground)
            res.render('comments/new', {campground: campground});
        }
    });
});

// CREATE ROUTE
router.post('/', isLoggedIn, async (req, res) => {

    // FIND CAMOGROUND BY ID
    let campground = await Campground.findById(req.params.id)
    
    // CREATE NEW COMMENT
    let comment = await Comment.create(req.body.comments)
    comment.author.id = req.user._id;
    comment.author.username = req.user.username;
    // console.log(comment);
    comment.save();

    // CONNECT NEW COMMENT TO CAMPGROUND
    campground.comments.push(comment);
    campground.save();
    
    // REDIRECT TO CAMPGROUND SHOW PAGE
    res.redirect(`/campgrounds/${req.params.id}`)
});

// EDIT ROUTE
router.get('/:comment_id/edit', checkCommentOwnership, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.comment_id);
        const campground = await Campground.findById(req.params.id);
        res.render('comments/edit', {comment: comment, campground: campground});
        
    } catch (error) {
        console.log(error);
    }
});
 
// UPDATE ROUTE
router.put('/:comment_id', checkCommentOwnership, async (req, res) => {
    try {
        await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comments);
        res.redirect(`/campgrounds/${req.params.id}`);
    } catch (error) {
        console.log(error);
    }

});

// DESTROY ROUTE
router.delete('/:comment_id', checkCommentOwnership, async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.comment_id)
        res.redirect(`/campgrounds/${req.params.id}`)
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;