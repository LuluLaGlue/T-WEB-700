var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');

const jwt = require("jsonwebtoken");
const keys = require('../config/keys.js');
const User = require("../models/user");
const passport = require("passport");

const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko()

const Crypto = require("../models/crypto");

const crypto_update = require('../config/cryptos.js');

router.route('/cryptos')
  .get(async function (req, res) {

    const token = req.header("authorization");
    if (token === undefined) {
      await Crypto.find({
        is_authorized: true
      }, null, {sort:{rank:1}}).then(crypto => {
        return res.status(200).json({
          message: "Cryptos",
          list: crypto,
          method: req.method
        })
      })
      .catch(err => {
        console.log(err);
        return res.json(err)
      })
    }
    else {
      let verifiedJwt = '';
      try {
        verifiedJwt = jwt.verify(token, keys.secretOrKey);
      } catch (e) {
        await Crypto.find({
          is_authorized: true
        }, null, {sort:{rank:1}}).then(crypto => {
          return res.status(200).json({
            message: "Cryptos",
            list: crypto,
            method: req.method
          })
        })
        .catch(err => {
          console.log(err);
          return res.json(err)
        })
      }

      let user_tmp;
      let crypto_list = [];

      await User.findOne({
        _id: verifiedJwt.id
      }).then(user => {
        user_tmp = user;
      })
      let datas = await crypto_update.sendAuthorizedCryptos(token).then(resp => resp)

      res.status(200).json({
        message: "User cryptos",
        list: datas,
        method: req.method
      })
    }
  })

  .post(async function (req, res) {

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

    if ((typeof req.body.crypto_list) == 'string'){
      await Crypto.findOne({
        id: req.body.crypto_list
      }).then(async crypto => {
          crypto_update.updateCryptoValues(crypto)
          crypto.is_authorized = true;
          crypto.save()
      })
      .catch(err => {
        console.log(err);
      })
    }
    else {
      for(item in req.body.crypto_list){
        let obj = req.body.crypto_list[item]

        await Crypto.findOne({
          id: obj
        }).then(async crypto => {
          crypto_update.updateCryptoValues(crypto)
          crypto.is_authorized = true;
          crypto.save()
        })
        .catch(err => {
          console.log(err);
        })
      }
    }

    res.json({
      message: "Following Cryptos Updated",
      list: req.body.crypto_list,
      method: req.method
    })
  })

  .delete(async function (req, res) {

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

    if ((typeof req.body.crypto_list) == 'string'){
      await Crypto.findOne({
        id: req.body.crypto_list
      }).then(async crypto => {
        crypto.is_authorized = false;
        crypto.save()
      })
      .catch(err => {
        console.log(err);
      })
    }
    else {
      for(item in req.body.crypto_list){
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
    }

    res.json({
      message: "Unfollowing Cryptos Updated",
      list: req.body.crypto_list,
      method: req.method
    })
  })

router.route('/cryptos/:cmid')
  .get(function (req, res) {

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

    Crypto.findOne({
      id: req.params.cmid
    }).then(crypto => {
      return res.status(200).json(crypto.periods[req.params.period])
    })
    .catch(err => {
      console.log(err);
      return res.json(err)
    })

  })

router.route('/requests')
  .get(async function (req, res) {

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

    await Crypto.find({
      is_requested: true
    }).then(crypto => {
      let crypto_list = []
      for (item in crypto){
        crypto_list.push(crypto[item].id)
      }
      return res.status(200).json({
        message: "Cryptos",
        list: crypto_list,
        method: req.method
      })
    })
    .catch(err => {
      console.log(err);
      return res.json(err)
    })

  })

  .post(async function (req, res) {

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

    if ((typeof req.body.crypto_list) == 'string'){
      await Crypto.findOne({
        id: req.body.crypto_list
      }).then(async crypto => {
        crypto.is_requested = true;
        crypto.save()
      })
      .catch(err => {
        console.log(err);
      })
    }
    else {
      for(item in req.body.crypto_list){
        let obj = req.body.crypto_list[item]

        await Crypto.findOne({
          id: obj
        }).then(async crypto => {
          crypto.is_requested = true;
          crypto.save()
        })
        .catch(err => {
          console.log(err);
        })
      }
    }

    res.json({
      message: "Following Cryptos requested",
      list: req.body.crypto_list,
      method: req.method
    })
  })

router.route('/validrequests')
  .post(async function (req, res) {

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

    if ((typeof req.body.crypto_list) == 'string'){
      await Crypto.findOne({
        id: req.body.crypto_list
      }).then(async crypto => {
          crypto_update.updateCryptoValues(crypto)
          crypto.is_authorized = true;
          crypto.is_requested = false;
          crypto.save()
      })
      .catch(err => {
        console.log(err);
      })
    }
    else {
      for(item in req.body.crypto_list){
        let obj = req.body.crypto_list[item]

        await Crypto.findOne({
          id: obj
        }).then(async crypto => {
          crypto_update.updateCryptoValues(crypto)
          crypto.is_authorized = true;
          crypto.is_requested = false;
          crypto.save()
        })
        .catch(err => {
          console.log(err);
        })
      }
    }

    res.json({
      message: "Following Cryptos authorized",
      list: req.body.crypto_list,
      method: req.method
    })
  })

module.exports = router
