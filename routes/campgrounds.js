const express       = require('express');
const app           = express();
const router        = express.Router();
const Campground    = require('../models/campground');
// const methodOverride    = require('method-override');

// METHOD OVERRIDE CONFIG
// app.use(methodOverride('_method'));

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
router.post('/', isLoggedIn, async (req, res) => {
    const name = req.body.name;
    const image = req.body.image;
    const description = req.body.description;
    const author = {id: req.user._id, username: req.user.username};

    const newCampground = {name: name, image: image, description: description, author: author};

    //CREATE NEW CAMPGROUND IN DB AND REDIRECT TO CAMPGROUNDS PAGE:
    try {
        await Campground.create(newCampground);
        console.log('NEW CAMPGROUND ADDED: ');
        res.redirect('/campgrounds'); 
    } catch (error) {
        console.log(error);
    }
});

//NEW ROUTE (SHOW FORM TO CREATE NEW CAMPGROUND)
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// SHOW ROUTE (DISPLAYS INFO ABOUT ONE ENTRY)
router.get('/:id', (req, res) => {
    Campground.findById(req.params.id).populate('comments').exec((err, retrievedData) => {
        if (err) {
            console.log(err);
        } else {
            // console.log(retrievedData)
            res.render('campgrounds/show', {campground: retrievedData})
        }
    }); 
});

// EDIT ROUTE (SHOW FORM TO EDIT CAMPGROUND)
router.get('/:id/edit', async (req, res) => {
    try {
        const campground = await Campground.findById(req.params.id);
        res.render('campgrounds/edit', {campground: campground});
    } catch (error) {
        console.log('COULD NOT RENDER CAMPGROUND EDIT PAGE');
    }
});

// UPDATE ROUTE (UPDATE CAMPGROUND DATA IN DB)
router.put('/:id', async (req, res) => {
    try {
        await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
        res.redirect(`/campgrounds/${req.params.id}`)
        
    } catch (error) {
        console.log('COULD NOT UPDATE CAMPGROUND');
    }
});

// DESTROY ROUTE
router.delete('/:id', async (req, res) => {
    try {
        await Campground.findByIdAndDelete(req.params.id);
        res.redirect('/campgrounds');
        
    } catch (error) {
        console.log('COULD NOT DELETE CAMPGROUND ENTRY');
    }
});


module.exports = router;