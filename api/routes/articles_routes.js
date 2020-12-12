var express = require("express");
const fetch = require("node-fetch");
const parser = require("fast-xml-parser");
const keys = require("../config/keys.js");
const jwt = require("jsonwebtoken");
const Bluebird = require("bluebird");
const User = require("../models/user");

fetch.Promise = Bluebird;

var router = express.Router();

router.get("/articles", (req, res) => {
  fetch("https://cointelegraph.com/rss")
    .then((resp) => resp.text())
    .then((str) => {
      const data = parser.parse(str);
      let articles = data.rss.channel.item;
      let response = [];
      if (
        req.header("authorization") &&
        process.env["USER_ID"] !== "undefined" &&
        process.env["USER_ID"] !== undefined
      ) {
        //if the user is not logged in the query will not take into account the params
        const token = req.header("authorization");
        if (token === undefined) {
          return res
            .status(401)
            .json({ message: "unauthorized", error: "no token" });
        }
        let verifiedJwt = "";
        try {
          verifiedJwt = jwt.verify(token, keys.secretOrKey);
        } catch (e) {
          console.log(e);
          return res.json(e);
        }
        let params = [];
        if (req.query.params) {
          params = req.query.params.toLowerCase().split(",");
          articles.sort(function (a, b) {
            return new Date(b.pubDate) - new Date(a.pubDate);
          });
          articles.map((value, index) => {
            value.guid = value.guid.replace(/[/]/g, "_");
            if (typeof value.category === "object") {
              value.category.map((value_b, index_b) => {
                params.map((value_t, index_t) => {
                  if (value_b.toLowerCase() === value_t) {
                    response.push({
                      id: value.guid,
                      title: value.title,
                      src: value.link,
                      description: value.description,
                      img: value["media:content"],
                    });
                  }
                });
              });
            } else {
              params.map((value_t, index_t) => {
                if (
                  value.category &&
                  value.category.toLowerCase() === value_t
                ) {
                  response.push({
                    id: value.guid,
                    title: value.title,
                    src: value.link,
                    description: value.description,
                    img: value["media:content"],
                  });
                }
              });
            }
          });
          const set = [...new Set(response)];
          res.json(set);
        } else {
          User.findOne({
            _id: verifiedJwt.id,
          }).then((usr) => {
            params = usr.articles;
            if (params.length === 0) {
              let response = [];
              articles.sort(function (a, b) {
                return new Date(b.pubDate) - new Date(a.pubDate);
              });
              articles.map((value, index) => {
                articles[index].guid = value.guid.replace(/[/]/g, "_");
                response.push({
                  id: value.guid,
                  title: value.title,
                  src: value.link,
                  description: value.description,
                  img: value["media:content"],
                });
              });
              res.json(response);
            } else {
              articles.sort(function (a, b) {
                return new Date(b.pubDate) - new Date(a.pubDate);
              });
              articles.map((value, index) => {
                value.guid = value.guid.replace(/[/]/g, "_");
                if (typeof value.category === "object") {
                  value.category.map((value_b, index_b) => {
                    if (params.length !== 0) {
                      params.map((value_t, index_t) => {
                        if (value_b.toLowerCase() === value_t.toLowerCase()) {
                          response.push({
                            id: value.guid,
                            title: value.title,
                            src: value.link,
                            description: value.description,
                            img: value["media:content"],
                          });
                        }
                      });
                    } else {
                      response.push({
                        id: value.guid,
                        title: value.title,
                        src: value.link,
                        description: value.description,
                        img: value["media:content"],
                      });
                    }
                  });
                } else {
                  if (params.length !== 0) {
                    params.map((value_t, index_t) => {
                      if (
                        value.category &&
                        value.category.toLowerCase() === value_t.toLowerCase()
                      ) {
                        response.push({
                          id: value.guid,
                          title: value.title,
                          src: value.link,
                          description: value.description,
                          img: value["media:content"],
                        });
                      }
                    });
                  } else {
                    response.push({
                      id: value.guid,
                      title: value.title,
                      src: value.link,
                      description: value.description,
                      img: value["media:content"],
                    });
                  }
                }
              });
              const set = [...new Set(response)];
              res.json(set);
            }
          });
        }
      } else {
        let response = [];
        articles.sort(function (a, b) {
          return new Date(b.pubDate) - new Date(a.pubDate);
        });
        articles.map((value, index) => {
          articles[index].guid = value.guid.replace(/[/]/g, "_");
          response.push({
            id: value.guid,
            title: value.title,
            src: value.link,
            description: value.description,
            img: value["media:content"],
          });
        });
        res.json(response);
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.get("/articles/:id", (req, res) => {
  fetch("https://cointelegraph.com/rss")
    .then((resp) => resp.text())
    .then((str) => {
      const data = parser.parse(str);
      let articles = data.rss.channel.item;
      let response = {};
      articles.map((value, index) => {
        value.guid = value.guid.replace(/[/]/g, "_");
        if (value.guid === req.params.id) {
          response = {
            id: value.guid,
            title: value.title,
            description: value.description,
            creator: value["dc:creator"],
            src: value.link,
            date: value.pubDate,
            img: value["media:content"],
          };
          res.json(response);
        }
      });
      if (response.id === undefined) {
        res.status(404).json({ error: "Article not found" });
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.get("/articles/list/categories", (req, res) => {
  fetch("https://cointelegraph.com/rss")
    .then((resp) => resp.text())
    .then((str) => {
      const data = parser.parse(str);
      let articles = data.rss.channel.item;
      let response = [];
      articles.map((value, index) => {
        if (typeof value.category === "object") {
          value.category.map((value_c, index_c) => {
            response.push(value_c);
          });
        } else if (value.category) {
          response.push(value.category);
        }
      });
      const set = [...new Set(response)];
      res.json(set);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

module.exports = router;
