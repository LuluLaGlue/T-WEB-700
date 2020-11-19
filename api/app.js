const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

var home_route = require("./routes/home_routes");
var crypto_route = require("./routes/crypto_routes")
const keys = require('./config/keys.js')
const users = require("./routes/user_routes");
const User = require("./models/user");

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
    User.findOne({
      email: userProfile.emails[0].value
    }).then((usr) => {
      if (usr) {
        let tmp = usr;
        tmp.username = undefined;
        const payload = {
          id: usr.id,
          role: usr.role
        };

        jwt.sign(
          payload,
          keys.secretOrKey, {
          expiresIn: 604800 // 1 week in seconds
        },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
        process.env['USER_ID'] = usr.id;
      } else {
        const newUser = new User({
          email: userProfile.emails[0].value,
          password: userProfile.id,
          username: userProfile.displayName || Math.random(),
          role: "user"
        });

        // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(usr => {
                let tmp = usr;
                tmp.username = undefined;
                const payload = {
                  id: usr.id,
                  role: usr.role
                };

                jwt.sign(
                  payload,
                  keys.secretOrKey, {
                  expiresIn: 604800 // 1 week in seconds
                },
                  (err, token) => {
                    res.json({
                      success: true,
                      token: "Bearer " + token
                    });
                  }
                );
                process.env['USER_ID'] = usr.id;
              }).catch(err => {
                if (err.code === 11000) {
                  let values = '';
                  for (let key in err.keyValue) {
                    values += err.keyValue[key] + ','
                  }
                  values = values.slice(0, -1);
                  res.json({ error: values + " is already taken" })
                } else {
                  res.json({ error: err.message })
                }
              });
          });
        });
      }
    })
  });

app.use("/users", users);
app.use(home_route);
app.use(crypto_route);

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});