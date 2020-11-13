var express = require('express');
var jwt = require('njwt');
const { send } = require('process');
var crypto = require('crypto');
var secureRandom = require('secure-random');
const settings = require('../const.js');
const { MongoClient } = require('mongodb');
const paramsCheck = require('../src/requiredParams');
const response = require('../src/response.js');

const client = new MongoClient(settings.api_url, { useUnifiedTopology: true });
var router = express.Router();

router.route('/users/register')
  .post(async function (req, res) {
    const check = paramsCheck(req.body, "email", "password");
    if (!check.success) {
      res.send(response(401, { error: "Missing parameter", param: check.error }))
      return 401
    }
    res.json({
      message: "Create a new user",
      method: req.method
    });
  })

router.route('/users/login')
  .post(async function (req, res) {
    const check = paramsCheck(req.body, "email", "password")
    if (!check.success) {
      res.send(response(401, { error: "Missing parameter", param: check.error }))
      return 401;
    }
    await client.connect();
    let dbList = await client.db().admin().listDatabases();
    console.log("Databases:")
    dbList.databases.forEach(db => {
      console.log(`  - ${db.name}`)
    });

    const email = req.body.email;
    const passwd = crypto.createHash('md5').update(req.body.password).digest("hex");

    const key = secureRandom(256, { type: 'Buffer' });
    const options = {
      iss: "http://cryptoapp.com/",
      sub: passwd
    }
    const jwt_token = jwt.create(options, key);
    jwt_token.setExpiration(new Date().getTime() + 86400 * 1000);
    res.send(response(200, { status: "connected", token: jwt_token.compact() }));
    await client.close();
    return 200;
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