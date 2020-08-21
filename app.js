//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                              CONFIG                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////

require('dotenv').config()
const express               = require('express');
const app                   = express();
const mongoose              = require('mongoose');
const { urlencoded }        = require('body-parser');
const { response }          = require('express');
const flash                 = require('connect-flash');
const seedDB                = require('./seeds')
const passport              = require('passport');
const localStrategy         = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose'); 
const methodOverride        = require('method-override');
const User                  = require('./models/user');
const Campground            = require('./models/campground');
const Comment               = require('./models/comment');
var port                    = process.env.PORT || 3000;

var session                 = require("express-session");
var MongoStore              = require("connect-mongo")(session);


// routes
const campgroundRoutes      = require('./routes/campgrounds');
const commentRoutes         = require('./routes/comments');
const indexRoutes           = require('./routes/index');


mongoose.connect(process.env.DATABASEURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));


// mongoose.connect('mongodb+srv://Lenny:gjEscmfHwQ9g4QH@cluster0.7fkkp.mongodb.net/yelp_camp?retryWrites=true&w=majority', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//     useCreateIndex: true
// })
// .then(() => console.log('Connected to DB!'))
// .catch(error => console.log(error.message));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(flash());

// SEED THE DATABASE
// seedDB();

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                           PASSPORT CONFIG                                            //
//////////////////////////////////////////////////////////////////////////////////////////////////////////

app.use(session({
    secret: 'Benny is the cutest pooch. 10/10, will pet even when wet.',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 } // 180 minutes session expiration
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use(indexRoutes);

// REDIRECT TO INDEX ROUTE
app.get('/', (req, res) => {
    res.render('landing');
});

app.listen(port, console.log(`YelpCamp server has started on Localhost:${port}`));