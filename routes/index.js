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

// MIDDLEWARE TO CHECK IF USER IS LOGGED IN
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

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
            return res.render('register');
        }
        passport.authenticate('local')(req, res, () => {
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
    res.redirect('/campgrounds');
});

module.exports = router;