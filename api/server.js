const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const locationRoutes = require("./routes/crypto")
const passport = require("passport");

const users = require("./routes/user");


const PORT = 4000;

// Middleware
app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());
app.use(passport.initialize());

// DB Config
mongoose.connect('mongodb://127.0.0.1:27017/weather', { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

// Passport config
require("./config/passport")(passport);

// Router as a middleware will take control of request starting with path /location
app.use('/location', locationRoutes);

// Routes
app.use("/user", users);

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});
