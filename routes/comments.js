const express       = require('express');
const app           = express();
const router        = express.Router({mergeParams: true});
const Campground    = require('../models/campground');
const Comment       = require('../models/comment');
const middleware    = require('../middleware');
const campground = require('../models/campground');

// PASSING LOGGED IN USER DATA TO ALL TEMPLATES
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// NEW ROUTE
router.get('/new', middleware.isLoggedIn, (req, res) => {
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
router.post('/', middleware.isLoggedIn, async (req, res) => {

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
router.get('/:comment_id/edit', middleware.checkCommentOwnership, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.comment_id);
        const campground = await Campground.findById(req.params.id);
        res.render('comments/edit', {comment: comment, campground: campground});
        
    } catch (error) {
        console.log(error);
    }
});
 
// UPDATE ROUTE
router.put('/:comment_id', middleware.checkCommentOwnership, async (req, res) => {
    try {
        const comment = Comment.findById(req.params.comment_id);
        if (!comment) {
            req.flash('error', 'Comment not found.');
            res.redirect('back');
        } else {
            await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comments);
            req.flash('success', 'Comment successfully updated!');
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    } catch (error) {
        req.flash('error', 'Campground not found.');
    }

});

// DESTROY ROUTE
router.delete('/:comment_id', middleware.checkCommentOwnership, async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.comment_id);
        req.flash('success', 'Comment successfully removed!');
        res.redirect(`/campgrounds/${req.params.id}`);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;