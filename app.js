// RESTFUL ROUTES
// --------------

// name    url         verb    description 
// =======================================
// INDEX   /dogs       GET     Display a list of all dogs 
// NEW     /dogs/new   GET     Displays form to make a new dog 
// CREATE  /dogs       POST    Add new dog to DB 
// SHOW    /dogs/:id   GET     Shows info about one dog

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { urlencoded } = require('body-parser');
const { response } = require('express');

const port = 3000;

mongoose.connect('mongodb://localhost:27017/yelp_camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

// CAMPGROUND SCHEMA SETUP:

const campgroundSchema = new mongoose.Schema({
    name: String,
    image: String
});

const Campground = mongoose.model('Campground', campgroundSchema);

// Campground.create({
//     name: "Witch Water Canyon", 
//     image:"https://images.unsplash.com/photo-1455763916899-e8b50eca9967?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80"
// }, (err, campground) => {
//     if (err) {
//         console.log('ERROR!');
//         console.log(err);
//     } else {
//         console.log('NEW CAMPGROUND CREATED:');
//         console.log(campground);
//     }
// })

app.get('/', (req, res) => {
    res.render('landing');
})

//INDEX ROUTE (SHOW ALL CAMPGROUNDS)
app.get('/campgrounds', (req, res) => {
    // RETRIEVE CAMPGROUND DATA FROM DATABASE:
    Campground.find({}, (err, campgrounds) => {
        if (err) {
            console.log(err);
        } else {
            res.render('campgrounds', {campgrounds: campgrounds});
        }
    })
});

//CREATE ROUTE (ADD NEW CAMPGROUNDS TO DATABASE)
app.post('/campgrounds', (req, res) => {
    const name = req.body.name;
    const image = req.body.image;
    const newCampground = {name: name, image: image};

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
    res.render('new');
});

// SHOW ROUTE (DISPLAYS INFO ABOUT ONE ENTRY)
app.get('/campgrounds/:id', (req, res) => {
    res.send('this will be the show page, one day...')
})

app.listen(port, console.log(`YelpCamp server has started on Localhost:${port}`));