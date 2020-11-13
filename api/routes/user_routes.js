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
  if (process.env['USER_ID'] !== "undefined" && process.env['USER_ID'] !== undefined) {
    return res
      .status(401)
      .json({ message: "unauthorized", error: "user must not be logged in" });
  }
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
        username: req.body.username || Math.random(),
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
            .catch(err => {
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
  });
});

router.post("/login", (req, res) => {
  if (process.env['USER_ID'] !== "undefined" && process.env['USER_ID'] !== undefined) {
    return res
      .status(401)
      .json({ message: "unauthorized", error: "user must not be logged in" });
  }
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
          expiresIn: 604800 // 1 week in seconds
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

router.post('/logout', (req, res) => {
  if (process.env['USER_ID'] === "undefined" || process.env['USER_ID'] === undefined) {
    return res
      .status(401)
      .json({ message: "unauthorized", error: "user must be logged in" });
  }
  const token = req.header("authorization");
  if (token === undefined) {
    return res.status(401).send(response(401, { message: "unauthorized", error: "no token" }))
  }

  try {
    jwt.verify(token, keys.secretOrKey);
  } catch (e) {
    console.log(e)
    return res.json(e)
  }
  process.env['USER_ID'] = undefined;
  return res.json({ message: "logged out" })

})

router.get('/profile', (req, res) => {
  if (process.env['USER_ID'] === "undefined" || process.env['USER_ID'] === undefined) {
    return res
      .status(401)
      .json({ message: "unauthorized", error: "user must be logged in" });
  }
  const token = req.header("authorization");
  if (token === undefined) {
    return res.status(401).send(response(401, { message: "unauthorized", error: "no token" }))
  }
  let verifiedJwt = '';
  try {
    verifiedJwt = jwt.verify(token, keys.secretOrKey);
  } catch (e) {
    console.log(e)
    return res.json(e)
  }
  User.findOne({
    _id: verifiedJwt.id
  }).then(user => {
    let tmp = user;
    tmp.username = undefined;
    return res.status(200).json(tmp)
  })
})

router.put('/profile', (req, res) => {
  if (process.env['USER_ID'] === "undefined" || process.env['USER_ID'] === undefined) {
    return res
      .status(401)
      .json({ message: "unauthorized", error: "user must be logged in" });
  }
  const token = req.header("authorization");
  if (token === undefined) {
    return res.status(401).send(response(401, { message: "unauthorized", error: "no token" }))
  }
  let verifiedJwt = '';
  try {
    verifiedJwt = jwt.verify(token, keys.secretOrKey);
  } catch (e) {
    console.log(e)
    return res.json(e)
  }
  User.findOne({
    _id: verifiedJwt.id
  }).then(user => {
    if (req.body.password) {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) throw err;
          user.password = hash;
          let body_tmp = req.body;
          body_tmp.password = undefined;
          for (let tmp in body_tmp) {
            user[tmp] = body_tmp[tmp];
          }
          user.password = hash
          user
            .save()
            .then(user => { let tmp = user; tmp.username = undefined; res.json(tmp) })
            .catch(err => {
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
    } else {
      for (let tmp in req.body) {
        user[tmp] = req.body[tmp];
      }

      user
        .save()
        .then(user => { let tmp = user; tmp.username = undefined; res.json(tmp) })
        .catch(err => console.log(err));
    }
  })

})

router.delete('/delete', (req, res) => {
  if (process.env['USER_ID'] === "undefined" || process.env['USER_ID'] === undefined) {
    return res
      .status(401)
      .json({ message: "unauthorized", error: "user must be logged in" });
  }
  const token = req.header("authorization");
  if (token === undefined) {
    return res.status(401).json({ message: "unauthorized", error: "token not valid" })
  }
  let verifiedJwt = '';
  try {
    verifiedJwt = jwt.verify(token, keys.secretOrKey);
  } catch (e) {
    console.log(e)
    return res.json(e)
  }
  if (verifiedJwt.role !== "admin") {
    return res.status(401).json({ message: "unauthorized", error: "token not valid" })
  }
  User.findOne({
    _id: req.body.id
  }).then(user => {
    user.deleteOne();
    return res.status(200).json({ message: "User has been deleted" })
  }).catch(err => {
    console.log(err);
    return res.json(err)
  })
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

module.exports = router