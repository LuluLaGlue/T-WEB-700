var express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const keys = require('../config/keys.js');
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
const User = require("../models/user");
const user = require('../models/user');

router.post("/register", (req, res) => {
  const {
    errors,
    isValid
  } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      return res.status(400).json({
        email: "Email already exists"
      });
    } else {
      const newUser = new User({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username || req.body.email,
        role: req.body.role || "user"
      });

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => { let tmp = user; tmp.username = undefined; res.json(tmp) })
            .catch(err => console.log(err));
        });
      });
    }
  });
});

router.post("/login", (req, res) => {
  const {
    errors,
    isValid
  } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({
    email
  }).then(user => {

    if (!user) {
      return res.status(404).json({
        emailnotfound: "Email not found"
      });
    }

    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {

        const payload = {
          id: user.id,
          role: user.role
        };

        jwt.sign(
          payload,
          keys.secretOrKey, {
          expiresIn: 31556926 // 1 year in seconds
        },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
        process.env['USER_ID'] = user.id;
      } else {
        return res
          .status(400)
          .json({
            passwordincorrect: "Password incorrect"
          });
      }
    });
  });
});

router.get('/profile', (req, res) => {
  if (!process.env['USER_ID']) {
    return res
      .status(401)
      .json({ message: "unauthorized", error: "user must be logged in" });
  }
  const token = req.header("authorization");
  if (token === undefined) {
    return res.status(401).send(response(401, { message: "unauthorized", error: "no token" }))
  }

  const verifiedJwt = jwt.verify(token, keys.secretOrKey);
  User.findOne({
    _id: verifiedJwt.id
  }).then(user => {
    let tmp = user;
    tmp.username = undefined;
    return res.status(200).json(tmp)
  })
})

router.put('/profile', (req, res) => {
  return res.status(200).json({ message: "ok" })
})

router.route('/users/auth/:provider')
  .get(function (req, res) {
    if (process.env['USER_ID']) {
      res.status(401).send(response(401, { message: "unauthorized", error: "user can not be logged in" }))
      return 401
    }
    res.json({
      message: "Trying to login via " + req.params.provider,
      method: req.method
    });
  })

router.route('/users/auth/:provider/callback')
  .get(function (req, res) {
    if (process.env['USER_ID']) {
      res.status(401).send(response(401, { message: "unauthorized", error: "user can not be logged in" }))
      return 401
    }
    res.json({
      message: "Getting info from " + req.params.provider,
      method: req.method
    });
  })

router.route('/users/logout')
  .post(function (req, res) {
    if (!process.env['USER_ID']) {
      res.status(401).send(response(401, { message: "unauthorized", error: "user must be logged in" }))
      return 401
    }
    const token = req.header("authorization")
    if (token === undefined) {
      res.status(401).send(response(401, { message: "unauthorized", error: "no token" }))
      return 401;
    }
    jwt.verify(token, settings.keysign, function (err, verifiedJwt) {
      if (err) {
        res.status(401).send(response(401, { message: "unauthorized", error: err.message }))
        return 401;
      } else {
        process.env['USER_ID'] = undefined;
        res.send(response(200, {
          message: "Logged out",
        }));
        //Get info from user with id = verifiedJwt.body.user_id
      }
    })
  })

module.exports = router