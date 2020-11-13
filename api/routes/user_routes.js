var express = require('express');
var jwt = require('njwt');
var crypto = require('crypto');
const { MongoClient } = require('mongodb');

const settings = require('../const.js');
const paramsCheck = require('../src/requiredParams');
const response = require('../src/response.js');
const log = require('../src/log.js');

const client = new MongoClient(settings.api_url, { useUnifiedTopology: true });
var router = express.Router();

router.route('/users/register')
  .post(async function (req, res) {
    if (process.env['USER_ID']) {
      res.status(401).send(response(401, { message: "unauthorized", error: "user can not be logged in" }))
      return 401
    }
    const check = paramsCheck(req.body, "email", "password");
    if (!check.success) {
      res.status(400).send(response(400, { message: "Missing parameter", params: check.error }))
      return 401
    }
    await client.connect();
    res.json({
      message: "Create a new user",
      method: req.method
    });
  })

router.route('/users/login')
  .post(async function (req, res) {
    if (process.env['USER_ID']) {
      log("LOGIN", "CHECKING LOGIN STATUS", "USER IS ALREADY LOGGED IN")
      res.status(401).send(response(401, { message: "unauthorized", error: "user can not be logged in" }))
      return 401
    }
    const check = paramsCheck(req.body, "email", "password")
    if (!check.success) {
      log("LOGIN", "CHECKING PARAMS", "PARAMETER IS MISSING")
      res.status(400).send(response(40, { message: "Missing parameter", param: check.error }))
      return 401;
    }
    await client.connect();
    let users = client.db("users");

    const email = req.body.email;
    const passwd = crypto.createHash('md5').update(req.body.password).digest("hex");
    //get user based on email + passwd -> process.env['USER_ID'] = id_du_user_connecte
    const key = settings.keysign;
    const user = await users.collection("users").findOne({
      email: email,
      passwd
    });
    if (user === null) {
      log("LOGIN", "CHECKING USER", "USER NOT FOUND")
      res.status(404).send(response(404, { message: "user not found" }))
      return 404;
    }
    console.log(user)
    const options = {
      iss: "http://cryptoapp.com/",
      user_id: user.id,
      role: user.role, // Put user role here
      sub: passwd
    }
    const jwt_token = jwt.create(options, key);

    jwt_token.setExpiration(new Date().getTime() + 86400 * 1000);
    console.log("Credentials ok")
    res.send(response(200, { message: "connected", token: jwt_token.compact() }));
    log("LOGIN", "USER LOGGED IN", user)
    await client.close();
    return 200;
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

router.route('/users/profile')
  .get(async function (req, res) {
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
        console.log(err)
        res.status(401).send(response(401, { message: "unauthorized", error: err.message }))
        return 401;
      } else {
        res.send({
          message: "Getting user info",
          method: req.method
        });
        //Get info from user with id = verifiedJwt.body.user_id
      }
    })
  })
  .put(function (req, res) {
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
        res.json({
          message: "updating user info",
          method: req.method
        });
        //Update info from user with id = verifiedJwt.body.user_id
      }
    })
  })

module.exports = router