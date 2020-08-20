const express   = require('express');
const app       = express();
const router    = express.Router();
const User      = require('../models/user');
const passport  = require('passport');

// PASSING LOGGED IN USER DATA TO ALL TEMPLATES
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

//SHOW REGISTER FORM
router.get('/register', (req, res) => {
    res.render('register');
});

//HANDLE SIGN-UP LOGIC
router.post('/register', (req, res) => {

    const newUser = new User({username: req.body.username});
    const newUserPassword = req.body.password;

    User.register(newUser, newUserPassword, (err, user) => {
        if (err) {
            console.log(err);
            req.flash('error', err.message)
            return res.redirect('back');
        }
        passport.authenticate('local')(req, res, () => {
            req.flash('success', `Welcome to Yelpcamp, ${req.body.username}`);
            res.redirect('/campgrounds');
        });
    });
});

// LOGIN ROUTE
router.get('/login', (req, res) => {
    res.render('login')
});

// HANDLE LOGIN LOGIC
router.post('/login', passport.authenticate('local',
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), (req, res) => {
});

// HANDLE LOGOUT LOGIC
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out.')
    res.redirect('/campgrounds');
});

module.exports = router;