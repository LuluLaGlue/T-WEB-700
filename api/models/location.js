const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let Location = new Schema({
    location_name: {
        type: String,
        required: true
    },
    location_wname: {
        type: String,
        default: ''
    },
    weather: {
        type: String,
        default: ''
    },
    weather_description: {
        type: String,
        default: ''
    },
    temp: {
        type: Number,
        default: 0
    },
    temp_min: {
        type: Number,
        default: 0
    },
    temp_max: {
        type: Number,
        default: 0
    },
});


module.exports = mongoose.model('Location', Location);
