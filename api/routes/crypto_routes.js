var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');

const jwt = require("jsonwebtoken");
const keys = require('../config/keys.js');
const User = require("../models/user");
const passport = require("passport");

const Crypto = require("../models/crypto");

router.route('/cryptos')
  .get(function (req, res) {

    const token = req.header("authorization");
    if (token === undefined) {
      return res.status(401).json({ message: "unauthorized", error: "no token" })
    }
    let verifiedJwt = '';
    try {
      verifiedJwt = jwt.verify(token, keys.secretOrKey);
    } catch (e) {
      console.log(e)
      return res.json(e)
    }

    Crypto.find({
      is_authorized: true
    }).then(crypto => {
      return res.status(200).json(crypto)
    })
      .catch(err => {
        console.log(err);
        return res.json(err)
      })
  })

  .post(async function (req, res) {

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

    for (item in req.body.crypto_list) {
      let obj = req.body.crypto_list[item]

      await Crypto.findOne({
        id: obj
      }).then(async crypto => {
        let resp_tmp;
        resp_tmp = await fetch(process.env.CRYPTO_API + '/currencies/ticker?key=' + process.env.CRYPTO_KEY + '&ids=' + crypto.id + '&interval=1h,1d,7d,30d&per-page=100&page=1', {
          method: 'GET',
        })
          .then(resp => resp.json())
          .catch(e => console.log(e))

        crypto.is_authorized = true;
        crypto.actual_price = resp_tmp[0].price
        crypto.highest_price = resp_tmp[0].high
        crypto.price_change._1h = resp_tmp[0]['1h'].price_change
        crypto.price_change._1d = resp_tmp[0]['1d'].price_change
        crypto.price_change._7d = resp_tmp[0]['7d'].price_change
        crypto.price_change._30d = resp_tmp[0]['30d'].price_change
        crypto.save()
      })
        .catch(err => {
          console.log(err);
        })
    }

    res.json({
      message: "Following Cryptos Updated",
      list: req.body.crypto_list,
      method: req.method
    })
  })

  .delete(async function (req, res) {

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

    for (item in req.body.crypto_list) {
      let obj = req.body.crypto_list[item]

      await Crypto.findOne({
        id: obj
      }).then(async crypto => {
        crypto.is_authorized = false;
        crypto.save()
      })
        .catch(err => {
          console.log(err);
        })
    }

    res.json({
      message: "Following Cryptos Updated",
      list: req.body.crypto_list,
      method: req.method
    })
  })

router.route('/cryptos/:cmid')
  .get(function (req, res) {

    const token = req.header("authorization");
    if (token === undefined) {
      return res.status(401).json({ message: "unauthorized", error: "no token" })
    }
    let verifiedJwt = '';
    try {
      verifiedJwt = jwt.verify(token, keys.secretOrKey);
    } catch (e) {
      console.log(e)
      return res.json(e)
    }

    Crypto.findOne({
      id: req.params.cmid
    }).then(crypto => {
      return res.status(200).json(crypto)
    })
      .catch(err => {
        console.log(err);
        return res.json(err)
      })

  })

  .delete(async function (req, res) {

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

    await Crypto.findOne({
      id: req.params.cmid
    }).then(async crypto => {
      crypto.is_authorized = false;
      crypto.save()
    })
      .catch(err => {
        console.log(err);
      })

    res.json({
      message: "Unfollowing Cryptos updated",
      id: req.params.cmid,
      method: req.method
    })
  })

router.route('/cryptos/:cmid/history/:period')
  .get(function (req, res) {

    const token = req.header("authorization");
    if (token === undefined) {
      return res.status(401).json({ message: "unauthorized", error: "no token" })
    }
    let verifiedJwt = '';
    try {
      verifiedJwt = jwt.verify(token, keys.secretOrKey);
    } catch (e) {
      console.log(e)
      return res.json(e)
    }

    let period = "_" + req.params.period
    Crypto.findOne({
      id: req.params.cmid
    }).then(crypto => {
      return res.status(200).json(crypto.price_change[period])
    })
      .catch(err => {
        console.log(err);
        return res.json(err)
      })

  })

module.exports = router
