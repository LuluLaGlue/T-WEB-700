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

router.route('/cryptos')
  .get(async function (req, res) {

    const token = req.header("authorization");
    if (token === undefined) {
      await Crypto.find({
        is_authorized: true
      }).then(crypto => {m
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
        console.log(e)
        return res.json(e)
      }

      let user_tmp;
      let crypto_list = [];

      await User.findOne({
        _id: verifiedJwt.id
      }).then(user => {
        user_tmp = user;
      })

      for(item in user_tmp.cryptos){
        let obj = user_tmp.cryptos[item]

        await Crypto.findOne({
          id: obj
        }).then(async crypto => {
          let resp_tmp;
          resp_tmp = await fetch(process.env.CRYPTO_API+'/currencies/ticker?key='+process.env.CRYPTO_KEY+'&ids='+crypto.id+'&convert=EUR&interval=1h,1d,7d,30d&per-page=100&page=1',{
            method:'GET',
          })
          .then(resp => resp.json())
          .catch(e => console.log(e))
          crypto_list.push(resp_tmp)
        })
        .catch(err => {
          console.log(err);
        })
      }

      res.status(200).json({
        message: "User cryptos",
        list: crypto_list,
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

          let crypto_tmp = crypto

          let resp_tmp;
          let ohlc_daily = [];
          let ohlc_hourly = [];
          let ohlc_minute = [];

          resp_tmp = await CoinGeckoClient.coins.fetch(crypto_tmp.id, {localization:false, sparkline: false});

          if (resp_tmp.data.market_data.current_price.eur) crypto_tmp.actual_price = resp_tmp.data.market_data.current_price.eur
          if (resp_tmp.data.market_data.price_change_24h) crypto_tmp.periods._1d = resp_tmp.data.market_data.price_change_24h
          if (resp_tmp.data.market_data.high_24h.eur) crypto_tmp.highest_price_day = resp_tmp.data.market_data.high_24h.eur
          if (resp_tmp.data.market_data.low_24h.eur) crypto_tmp.lowest_price_day = resp_tmp.data.market_data.low_24h.eur
          if (resp_tmp.data.market_data.market_cap.eur) crypto_tmp.market_cap = resp_tmp.data.market_data.market_cap.eur
          if (resp_tmp.data.market_data.circulating_supply.eur) crypto_tmp.circulating_supply = resp_tmp.data.market_data.circulating_supply.eur

          let data_day = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=1',{
            method:'GET',
          }).then(resp => resp.json())
            .catch(e => console.log(error))

          crypto_tmp.periods.last_24h.opening_prices = []
          crypto_tmp.periods.last_24h.highest_prices = []
          crypto_tmp.periods.last_24h.lowest_prices = []
          crypto_tmp.periods.last_24h.closing_rates = []

          for (price in data_day){
            crypto_tmp.periods.last_24h.opening_prices.push(data_day[price][1])
            crypto_tmp.periods.last_24h.highest_prices.push(data_day[price][2])
            crypto_tmp.periods.last_24h.lowest_prices.push(data_day[price][3])
            crypto_tmp.periods.last_24h.closing_rates.push(data_day[price][4])
          }
          crypto_tmp.save()

          let data_week = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=7',{
            method:'GET',
          }).then(resp => resp.json())
            .catch(e => console.log(error))

          crypto_tmp.periods.last_week.opening_prices = []
          crypto_tmp.periods.last_week.highest_prices = []
          crypto_tmp.periods.last_week.lowest_prices = []
          crypto_tmp.periods.last_week.closing_rates = []

          for (let i=0;i<data_week.length;i=i+6){
            crypto_tmp.periods.last_week.opening_prices.push(data_week[i][1])
            crypto_tmp.periods.last_week.highest_prices.push(data_week[i][2])
            crypto_tmp.periods.last_week.lowest_prices.push(data_week[i][3])
            crypto_tmp.periods.last_week.closing_rates.push(data_week[i][4])
          }

          let data_monthly = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=30',{
            method:'GET',
          }).then(resp => resp.json())
            .catch(e => console.log(error))
          crypto_tmp.periods.last_month.opening_prices = []
          crypto_tmp.periods.last_month.highest_prices = []
          crypto_tmp.periods.last_month.lowest_prices = []
          crypto_tmp.periods.last_month.closing_rates = []

          for (let i=0;i<data_monthly.length;i=i+6){
            crypto_tmp.periods.last_month.opening_prices.push(data_monthly[i][1])
            crypto_tmp.periods.last_month.highest_prices.push(data_monthly[i][2])
            crypto_tmp.periods.last_month.lowest_prices.push(data_monthly[i][3])
            crypto_tmp.periods.last_month.closing_rates.push(data_monthly[i][4])
          }

          crypto_tmp.is_authorized = true;
          crypto_tmp.save()

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
          let crypto_tmp = crypto

          let resp_tmp;
          let ohlc_daily = [];
          let ohlc_hourly = [];
          let ohlc_minute = [];

          resp_tmp = await CoinGeckoClient.coins.fetch(crypto_tmp.id, {localization:false, sparkline: false});

          if (resp_tmp.data.market_data.current_price.eur) crypto_tmp.actual_price = resp_tmp.data.market_data.current_price.eur
          if (resp_tmp.data.market_data.price_change_24h) crypto_tmp.periods._1d = resp_tmp.data.market_data.price_change_24h
          if (resp_tmp.data.market_data.high_24h.eur) crypto_tmp.highest_price_day = resp_tmp.data.market_data.high_24h.eur
          if (resp_tmp.data.market_data.low_24h.eur) crypto_tmp.lowest_price_day = resp_tmp.data.market_data.low_24h.eur
          if (resp_tmp.data.market_data.market_cap.eur) crypto_tmp.market_cap = resp_tmp.data.market_data.market_cap.eur
          if (resp_tmp.data.market_data.circulating_supply.eur) crypto_tmp.circulating_supply = resp_tmp.data.market_data.circulating_supply.eur

          let data_day = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=1',{
            method:'GET',
          }).then(resp => resp.json())
            .catch(e => console.log(error))

          crypto_tmp.periods.last_24h.opening_prices = []
          crypto_tmp.periods.last_24h.highest_prices = []
          crypto_tmp.periods.last_24h.lowest_prices = []
          crypto_tmp.periods.last_24h.closing_rates = []

          for (price in data_day){
            crypto_tmp.periods.last_24h.opening_prices.push(data_day[price][1])
            crypto_tmp.periods.last_24h.highest_prices.push(data_day[price][2])
            crypto_tmp.periods.last_24h.lowest_prices.push(data_day[price][3])
            crypto_tmp.periods.last_24h.closing_rates.push(data_day[price][4])
          }
          crypto_tmp.save()

          let data_week = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=7',{
            method:'GET',
          }).then(resp => resp.json())
            .catch(e => console.log(error))

          crypto_tmp.periods.last_week.opening_prices = []
          crypto_tmp.periods.last_week.highest_prices = []
          crypto_tmp.periods.last_week.lowest_prices = []
          crypto_tmp.periods.last_week.closing_rates = []

          for (let i=0;i<data_week.length;i=i+6){
            crypto_tmp.periods.last_week.opening_prices.push(data_week[i][1])
            crypto_tmp.periods.last_week.highest_prices.push(data_week[i][2])
            crypto_tmp.periods.last_week.lowest_prices.push(data_week[i][3])
            crypto_tmp.periods.last_week.closing_rates.push(data_week[i][4])
          }

          let data_monthly = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=30',{
            method:'GET',
          }).then(resp => resp.json())
            .catch(e => console.log(error))
          crypto_tmp.periods.last_month.opening_prices = []
          crypto_tmp.periods.last_month.highest_prices = []
          crypto_tmp.periods.last_month.lowest_prices = []
          crypto_tmp.periods.last_month.closing_rates = []

          for (let i=0;i<data_monthly.length;i=i+6){
            crypto_tmp.periods.last_month.opening_prices.push(data_monthly[i][1])
            crypto_tmp.periods.last_month.highest_prices.push(data_monthly[i][2])
            crypto_tmp.periods.last_month.lowest_prices.push(data_monthly[i][3])
            crypto_tmp.periods.last_month.closing_rates.push(data_monthly[i][4])
          }

          crypto_tmp.is_authorized = true;
          crypto_tmp.save()
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
      return res.status(200).json(crypto.price_change[req.params.period])
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

          let crypto_tmp = crypto

          let resp_tmp;
          let ohlc_daily = [];
          let ohlc_hourly = [];
          let ohlc_minute = [];

          resp_tmp = await CoinGeckoClient.coins.fetch(crypto_tmp.id, {localization:false, sparkline: false});

          if (resp_tmp.data.market_data.current_price.eur) crypto_tmp.actual_price = resp_tmp.data.market_data.current_price.eur
          if (resp_tmp.data.market_data.price_change_24h) crypto_tmp.periods._1d = resp_tmp.data.market_data.price_change_24h
          if (resp_tmp.data.market_data.high_24h.eur) crypto_tmp.highest_price_day = resp_tmp.data.market_data.high_24h.eur
          if (resp_tmp.data.market_data.low_24h.eur) crypto_tmp.lowest_price_day = resp_tmp.data.market_data.low_24h.eur
          if (resp_tmp.data.market_data.market_cap.eur) crypto_tmp.market_cap = resp_tmp.data.market_data.market_cap.eur
          if (resp_tmp.data.market_data.circulating_supply.eur) crypto_tmp.circulating_supply = resp_tmp.data.market_data.circulating_supply.eur

          let data_day = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=1',{
            method:'GET',
          }).then(resp => resp.json())
            .catch(e => console.log(error))

          crypto_tmp.periods.last_24h.opening_prices = []
          crypto_tmp.periods.last_24h.highest_prices = []
          crypto_tmp.periods.last_24h.lowest_prices = []
          crypto_tmp.periods.last_24h.closing_rates = []

          for (price in data_day){
            crypto_tmp.periods.last_24h.opening_prices.push(data_day[price][1])
            crypto_tmp.periods.last_24h.highest_prices.push(data_day[price][2])
            crypto_tmp.periods.last_24h.lowest_prices.push(data_day[price][3])
            crypto_tmp.periods.last_24h.closing_rates.push(data_day[price][4])
          }
          crypto_tmp.save()

          let data_week = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=7',{
            method:'GET',
          }).then(resp => resp.json())
            .catch(e => console.log(error))

          crypto_tmp.periods.last_week.opening_prices = []
          crypto_tmp.periods.last_week.highest_prices = []
          crypto_tmp.periods.last_week.lowest_prices = []
          crypto_tmp.periods.last_week.closing_rates = []

          for (let i=0;i<data_week.length;i=i+6){
            crypto_tmp.periods.last_week.opening_prices.push(data_week[i][1])
            crypto_tmp.periods.last_week.highest_prices.push(data_week[i][2])
            crypto_tmp.periods.last_week.lowest_prices.push(data_week[i][3])
            crypto_tmp.periods.last_week.closing_rates.push(data_week[i][4])
          }

          let data_monthly = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=30',{
            method:'GET',
          }).then(resp => resp.json())
            .catch(e => console.log(error))
          crypto_tmp.periods.last_month.opening_prices = []
          crypto_tmp.periods.last_month.highest_prices = []
          crypto_tmp.periods.last_month.lowest_prices = []
          crypto_tmp.periods.last_month.closing_rates = []

          for (let i=0;i<data_monthly.length;i=i+6){
            crypto_tmp.periods.last_month.opening_prices.push(data_monthly[i][1])
            crypto_tmp.periods.last_month.highest_prices.push(data_monthly[i][2])
            crypto_tmp.periods.last_month.lowest_prices.push(data_monthly[i][3])
            crypto_tmp.periods.last_month.closing_rates.push(data_monthly[i][4])
          }

          crypto_tmp.is_requested = false;
          crypto_tmp.is_authorized = true;
          crypto_tmp.save()

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
          let crypto_tmp = crypto

          let resp_tmp;
          let ohlc_daily = [];
          let ohlc_hourly = [];
          let ohlc_minute = [];

          resp_tmp = await CoinGeckoClient.coins.fetch(crypto_tmp.id, {localization:false, sparkline: false});

          if (resp_tmp.data.market_data.current_price.eur) crypto_tmp.actual_price = resp_tmp.data.market_data.current_price.eur
          if (resp_tmp.data.market_data.price_change_24h) crypto_tmp.periods._1d = resp_tmp.data.market_data.price_change_24h
          if (resp_tmp.data.market_data.high_24h.eur) crypto_tmp.highest_price_day = resp_tmp.data.market_data.high_24h.eur
          if (resp_tmp.data.market_data.low_24h.eur) crypto_tmp.lowest_price_day = resp_tmp.data.market_data.low_24h.eur
          if (resp_tmp.data.market_data.market_cap.eur) crypto_tmp.market_cap = resp_tmp.data.market_data.market_cap.eur
          if (resp_tmp.data.market_data.circulating_supply.eur) crypto_tmp.circulating_supply = resp_tmp.data.market_data.circulating_supply.eur

          let data_day = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=1',{
            method:'GET',
          }).then(resp => resp.json())
            .catch(e => console.log(error))

          crypto_tmp.periods.last_24h.opening_prices = []
          crypto_tmp.periods.last_24h.highest_prices = []
          crypto_tmp.periods.last_24h.lowest_prices = []
          crypto_tmp.periods.last_24h.closing_rates = []

          for (price in data_day){
            crypto_tmp.periods.last_24h.opening_prices.push(data_day[price][1])
            crypto_tmp.periods.last_24h.highest_prices.push(data_day[price][2])
            crypto_tmp.periods.last_24h.lowest_prices.push(data_day[price][3])
            crypto_tmp.periods.last_24h.closing_rates.push(data_day[price][4])
          }
          crypto_tmp.save()

          let data_week = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=7',{
            method:'GET',
          }).then(resp => resp.json())
            .catch(e => console.log(error))

          crypto_tmp.periods.last_week.opening_prices = []
          crypto_tmp.periods.last_week.highest_prices = []
          crypto_tmp.periods.last_week.lowest_prices = []
          crypto_tmp.periods.last_week.closing_rates = []

          for (let i=0;i<data_week.length;i=i+6){
            crypto_tmp.periods.last_week.opening_prices.push(data_week[i][1])
            crypto_tmp.periods.last_week.highest_prices.push(data_week[i][2])
            crypto_tmp.periods.last_week.lowest_prices.push(data_week[i][3])
            crypto_tmp.periods.last_week.closing_rates.push(data_week[i][4])
          }

          let data_monthly = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=30',{
            method:'GET',
          }).then(resp => resp.json())
            .catch(e => console.log(error))
          crypto_tmp.periods.last_month.opening_prices = []
          crypto_tmp.periods.last_month.highest_prices = []
          crypto_tmp.periods.last_month.lowest_prices = []
          crypto_tmp.periods.last_month.closing_rates = []

          for (let i=0;i<data_monthly.length;i=i+6){
            crypto_tmp.periods.last_month.opening_prices.push(data_monthly[i][1])
            crypto_tmp.periods.last_month.highest_prices.push(data_monthly[i][2])
            crypto_tmp.periods.last_month.lowest_prices.push(data_monthly[i][3])
            crypto_tmp.periods.last_month.closing_rates.push(data_monthly[i][4])
          }

          crypto_tmp.is_requested = false;
          crypto_tmp.is_authorized = true;
          crypto_tmp.save()
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
