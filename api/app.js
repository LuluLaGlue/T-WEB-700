const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require("passport");

var home_route = require("./routes/home_routes");
var crypto_route = require("./routes/crypto_routes")
const keys = require('./config/keys.js')
const users = require("./routes/user_routes");

var userProfile;
const PORT = 3000;


const app = express();
process.env['USER_ID'] === "undefined"

// Middleware
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

// DB Config
mongoose.connect(keys.api_url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;

connection.once('open', function () {
  console.log("MongoDB database connection established successfully");
})

// Passport config
require("./config/passport")(passport);


app.use("/users", users);
app.use(home_route);
app.use(crypto_route);

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});