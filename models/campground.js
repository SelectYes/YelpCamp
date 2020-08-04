const mongoose = require('mongoose');
const comment = require('./comment');

const campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String, 
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model('Campground', campgroundSchema);