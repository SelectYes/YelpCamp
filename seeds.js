const mongoose = require('mongoose');
const Campground = require('./models/campground');

const seedDB = () => {
    Campground.deleteMany({}, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log('DB cleared!');
        }
    });
}

module.exports = seedDB;