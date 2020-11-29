const express = require("express");
const router = express.Router();
const Location = require("../models/location");
const axios = require('axios');


// Endpoint which is delivering all available location items
router.route('/').get(function(req, res) {
    Location.find(function(err, locations) {
        if (err) {
            console.log(err);
        } else {
            res.json(locations);
        }
    });
});

// Endpoint /:id to view a location from it's id
router.route('/:id').get(function(req, res) {
    Location.findById(req.params.id, function(err, location) {
        res.json(location);
    });
});

// Endpoint /add to add a new location
router.route('/add').post(function(req, res) {
    let location = new Location(req.body);
    location.save().then(location => {
        res.status(200).json({'location': 'location added successfully'});
    }).catch(err => {
        res.status(400).send('adding new location failed');
    });
});

// Endpoint /update/:id to update a location
router.route('/update/:id').post(function(req, res) {
    Location.findById(req.params.id, function(err, location) {
        if (!location)
            res.status(404).send("data is not found");
        else
            location.location_name = req.body.location_name;

            location.save().then(location => {
                res.json('location updated!');
            }).catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

// Endpoint /delete/:id to delete a location from it's id
router.route('/delete/:id').get(function(req, res) {
    Location.findByIdAndRemove(req.params.id, (err, location) => {
        if (err) return res.status(500).send(err);
        const response = {
            message: "Location successfully deleted",
        };
        return res.status(200).send(response);
    });
});

// Endpoint /updateweather/:id to update a location from openweather
router.route('/updateweather/:id').get(function(req, res) {
    Location.findById(req.params.id, async (err, location) => {
        if (!location) {
            res.status(404).send("data is not found");
        } else {

            let weather = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${location.location_name}&appid=e1a77775cf17fac1e69d16b1a1af1f99&units=metric`
            ).then(
                weather => weather.data
            ).catch(function (error){console.log(error);})

            location.location_wname = weather.name;
            location.weather = weather.weather[0].main;
            location.weather_description = weather.weather[0].main;
            location.temp = Math.trunc(weather.main.temp);
            location.temp_min = Math.trunc(weather.main.temp_min);
            location.temp_max = Math.trunc(weather.main.temp_max);

            location.save().then(location => {
                res.json('location updated!');
            }).catch(err => {
                res.status(400).send("Update not possible");
            });
        }
    });
});


module.exports = router;
