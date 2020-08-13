//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                              CONFIG                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////

const express               = require('express');
const app                   = express();
const mongoose              = require('mongoose');
const { urlencoded }        = require('body-parser');
const { response }          = require('express');
const Campground            = require('./models/campground');
const seedDB                = require('./seeds')
const Comment               = require('./models/comment');
const passport              = require('passport');
const localStrategy         = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose'); 
const User                  = require('./models/user');
const port = 3000;

// routes
const campgroundRoutes      = require('./routes/campgrounds');
const commentRoutes         = require('./routes/comments');
const indexRoutes           = require('./routes/index');


mongoose.connect('mongodb://localhost:27017/yelp_camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));

// SEED THE DATABASE
// seedDB();

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                           PASSPORT CONFIG                                            //
//////////////////////////////////////////////////////////////////////////////////////////////////////////

app.use(require('express-session')({
    secret: 'Benny is the cutest pooch. 10/10, will pet even when wet.',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use(indexRoutes);

// REDIRECT TO INDEX ROUTE
app.get('/', (req, res) => {
    res.redirect('/campgrounds');
});

app.listen(port, console.log(`YelpCamp server has started on Localhost:${port}`));