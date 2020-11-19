const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var home_route = require("./routes/home_routes");
var crypto_route = require("./routes/crypto_routes")
const keys = require('./config/keys.js')
const users = require("./routes/user_routes");

var userProfile;
const PORT = 3000;
const GOOGLE_CLIENT_ID = '1031311114983-p6mgeb1isu5reba41dsskmdatio1jt4f.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'aRcKfvzem-_j3RfVNhzCBlA5';

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
app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});
// Routes
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/users/auth/google/callback"
},
  function (accessToken, refreshToken, profile, done) {
    userProfile = profile;
    return done(null, userProfile);
  }
));

app.get('/users/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));;
app.get('/users/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  function (req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
  });

app.use("/users", users);
app.use(home_route);
app.use(crypto_route);

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});