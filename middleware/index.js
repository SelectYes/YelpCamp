const Campground = require('../models/campground');
const Comment = require('../models/comment');

const middlewareObj = {};

middlewareObj.checkCampgroundOwnership = async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const campground = await Campground.findById(req.params.id);
            if (campground.author.id.equals(req.user._id)){
                next();
            } else {
                req.flash('error', 'You do not have permission to do that.');
                res.redirect("back");
            }
        } else {
            req.flash('error', 'You need to be logged in to do that.');
            res.redirect("back"); 
        }
    } catch (error) {
        req.flash('error', 'Campground not found.');
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const comment = await Comment.findById(req.params.comment_id);
            if (comment.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash('error', 'You do not have permission to do that.');
                res.redirect('back');
            }
        } else {
            req.flash('error', 'You need to be logged in to do that.');
            res.redirect('back');
        }
    } catch (error) {
        req.flash('error', 'Campground not found.');
        res.redirect('next');
    }
};

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'You need to be logged in to do that.');
    res.redirect('/login');
}

module.exports = middlewareObj;