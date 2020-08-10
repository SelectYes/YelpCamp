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


mongoose.connect('mongodb://localhost:27017/yelp_camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));


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

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                         CAMPGROUND ROUTES                                            //
//////////////////////////////////////////////////////////////////////////////////////////////////////////

// seedDB();

app.get('/', (req, res) => {
    res.redirect('/campgrounds');
});

//INDEX ROUTE (SHOW ALL CAMPGROUNDS)
app.get('/campgrounds', (req, res) => {
    // RETRIEVE CAMPGROUND DATA FROM DATABASE:
    Campground.find({}, (err, campgrounds) => {
        if (err) {
            console.log(err);
        } else {
            res.render('campgrounds/index', {campgrounds: campgrounds})
        }
    });
});

//CREATE ROUTE (ADD NEW CAMPGROUNDS TO DATABASE)
app.post('/campgrounds', (req, res) => {
    const name = req.body.name;
    const image = req.body.image;
    const description = req.body.description;

    const newCampground = {name: name, image: image, description: description};

    //CREATE NEW CAMPGROUND IN DB AND REDIRECT TO CAMPGROUNDS PAGE:
    Campground.create(newCampground, (err, campground) => {
        if (err) {
            console.log(err);
        } else {
            console.log('NEW CAMPGROUND ADDED: ');
            console.log(campground);
            res.redirect('/campgrounds');
        }
    })
});

//NEW ROUTE (SHOW FORM TO CREATE NEW CAMPGROUND)
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// SHOW ROUTE (DISPLAYS INFO ABOUT ONE ENTRY)
app.get('/campgrounds/:id', (req, res) => {
    Campground.findById(req.params.id).populate('comments').exec((err, retrievedData) => {
        if (err) {
            console.log(err);
        } else {
            res.render('campgrounds/show', {campground: retrievedData})
        }
    })    
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                          COMMENTS ROUTES                                             //
//////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/campgrounds/:id/comments/new', isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
        } else {
            // console.log(campground)
            res.render('comments/new', {campground: campground});
        }
    });
});

app.post('/campgrounds/:id/comments', isLoggedIn, async (req, res) => {

    // FIND CAMOGROUND BY ID
    let campground = await Campground.findById(req.params.id)
    
    // CREATE NEW COMMENT
    let comment = await Comment.create(req.body.comments)
    
    // CONNECT NEW COMMENT TO CAMPGROUND
    campground.comments.push(comment);
    campground.save();
    
    // REDIRECT TO CAMPGROUND SHOW PAGE
    res.redirect(`/campgrounds/${req.params.id}`)
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                       AUTHENTICATION ROUTES                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////

//SHOW REGISTER FORM
app.get('/register', (req, res) => {
    res.render('register');
});

//HANDLE SIGN-UP LOGIC
app.post('/register', (req, res) => {

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
app.get('/login', (req, res) => {
    res.render('login')
});

// HANDLE LOGIN LOGIC
app.post('/login', passport.authenticate('local',
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), (req, res) => {
});

// HANDLE LOGOUT LOGIC
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/campgrounds');
});

app.listen(port, console.log(`YelpCamp server has started on Localhost:${port}`));