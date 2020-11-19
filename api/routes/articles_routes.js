var express = require('express');
const fetch = require('node-fetch');
const parser = require('fast-xml-parser');
const keys = require('../config/keys.js');
const jwt = require("jsonwebtoken");
const Bluebird = require('bluebird');

fetch.Promise = Bluebird;

var router = express.Router();

router.get('/articles', (req, res) => {
  fetch('https://cointelegraph.com/rss')
    .then(resp => resp.text())
    .then(str => {
      const data = parser.parse(str)
      let articles = data.rss.channel.item
      let response = [];
      if (req.query.params && req.header("authorization") && process.env['USER_ID'] !== "undefined" && process.env['USER_ID'] !== undefined) { //if the user is not logged in the query will not take into account the params
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
        let params = req.query.params.toLowerCase().split(',');

        articles.map((value, index) => {
          value.guid = value.guid.replace(/[/]/g, '_')
          if (typeof value.category === "object") {
            value.category.map((value_b, index_b) => {
              params.map((value_t, index_t) => {
                if (value_b.toLowerCase() === value_t) {
                  response.push(value)
                }
              })
            })
          } else {
            params.map((value_t, index_t) => {
              if (value.category.toLowerCase() === value_t) {
                response.push(value)
              }
            })
          }
        })
        const set = [... new Set(response)]
        res.json(set)
      } else {
        articles.map((value, index) => {
          articles[index].guid = value.guid.replace(/[/]/g, '_')
        })
        res.json(articles)
      }
    })
    .catch(err => {
      res.status(400).json(err)
    })
})

router.get('/articles/:id', (req, res) => {
  fetch('https://cointelegraph.com/rss')
    .then(resp => resp.text())
    .then(str => {
      const data = parser.parse(str)
      let articles = data.rss.channel.item;
      articles.map((value, index) => {
        value.guid = value.guid.replace(/[/]/g, '_')
        if (value.guid === req.params.id) {
          res.json(value)
        }
      })
    })
    .catch(err => {
      res.status(400).json(err)
    })
})

module.exports = router