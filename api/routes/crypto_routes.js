var express = require('express');
var router = express.Router();


router.get("/cryptos", (req, res) => {
  res.json({
    message: "Accessing cryptos",
    cmids: req.query.cmids,
    method: req.method
  })
})

router.post("/cryptos", (req, res) => {
  res.json({
    message: "Adding new crypto",
    method: req.method
  })
})

router.route("/cryptos/:cmid", (req, res) => {
  res.json({
    message: "Accessing cryptos n" + req.params.cmid,
    method: req.method
  })
})

router.delete("/cryptos/:cmid", (req, res) => {
  res.json({
    message: "Deleting crypto n" + req.params.cmid,
    method: req.method
  })
})

router.get("/cryptos/:cmid/history/:period", (req, res) => {
  res.json({
    message: "Get cryptos n" + req.params.cmid + " during the period " + req.params.period,
    method: req.method
  })
})

module.exports = router