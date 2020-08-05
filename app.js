//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                              CONFIG                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { urlencoded } = require('body-parser');
const { response } = require('express');
const Campground = require('./models/campground');
const port = 3000;
const seedDB = require('./seeds')
const Comment = require('./models/comment');


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
//                                              ROUTES                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////

// seedDB();

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
            res.render('campgrounds/index', {campgrounds: campgrounds});
        }
    })
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

app.get('/campgrounds/:id/comments/new', (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
        } else {
            // console.log(campground)
            res.render('comments/new', {campground: campground});
        }
    });
});

app.post('/campgrounds/:id/comments', async (req, res) => {

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



// ======================================================================

// app.post('/campgrounds/:id/comments', (req, res) => {

//     // FIND CAMOGROUND BY ID
//     Campground.findById(req.params.id, (err, campground) => {
//         if (err) {
//             console.log(err);
//         } else {
//             // CREATE NEW COMMENT
//             Comment.create(req.body.comments, (err, comment) => {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     // CONNECT NEW COMMENT TO CAMPGROUND
//                     campground.comments.push(comment);
//                     campground.save();
//                     // REDIRECT TO CAMPGROUND SHOW PAGE
//                     res.redirect(`/campgrounds/${req.params.id}`)
//                 }
//             })
//         }
//     });
// });

// ======================================================================
app.listen(port, console.log(`YelpCamp server has started on Localhost:${port}`));