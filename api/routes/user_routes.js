var express = require('express');
var jwt = require('njwt');
const { send } = require('process');
var crypto = require('crypto');
var secureRandom = require('secure-random');
const settings = require('../const.js');
const { MongoClient } = require('mongodb');
var router = express.Router();
const client = new MongoClient(settings.api_url);

router.route('/users/register')
  .post(function (req, res) {
    res.json({
      message: "Create a new user",
      method: req.method
    });
  })

router.route('/users/login')
  .post(function (req, res) {
    const email = req.body.email;
    const passwd = crypto.createHash('md5').update(req.body.password).digest("hex");
    await client.connect();

    // Check if user exists and if yes if credentials are ok

    const key = secureRandom(256, { type: 'Buffer' });
    const options = {
      iss: "http://cryptoapp.com/",
      sub: passwd
    }
    const jwt_token = jwt.create(options, key);
    jwt_token.setExpiration(new Date().getTime() + 86400 * 1000);
    res.send(jwt_token.compact());
  })

router.route('/users/auth/:provider')
  .get(function (req, res) {
    res.json({
      message: "Trying to login via " + req.params.provider,
      method: req.method
    });
  })

router.route('/users/auth/:provider/callback')
  .get(function (req, res) {
    res.json({
      message: "Getting info from " + req.params.provider,
      method: req.method
    });
  })

router.route('/users/logout')
  .post(function (req, res) {
    res.json({
      message: "Logging out",
      method: req.method
    });
  })

router.route('/users/profile')
  .get(function (req, res) {
    res.json({
      message: "Getting user info",
      method: req.method
    });
  })
  .put(function (req, res) {
    res.json({
      message: "updating user info",
      method: req.method
    });
  })
module.exports = router