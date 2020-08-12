const express       = require('express');
const app           = express();
const router        = express.Router();
const Campground    = require('../models/campground');

// PASSING LOGGED IN USER DATA TO ALL TEMPLATES
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

//INDEX ROUTE (SHOW ALL CAMPGROUNDS)
router.get('/', (req, res) => {
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
router.post('/', (req, res) => {
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
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});

// SHOW ROUTE (DISPLAYS INFO ABOUT ONE ENTRY)
router.get('/:id', (req, res) => {
    Campground.findById(req.params.id).populate('comments').exec((err, retrievedData) => {
        if (err) {
            console.log(err);
        } else {
            res.render('campgrounds/show', {campground: retrievedData})
        }
    })    
});

module.exports = router;