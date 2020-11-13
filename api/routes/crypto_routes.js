var express = require('express');
var router = express.Router();

router.route('/cryptos')
  .get(function (req, res) {
    res.json({
      message: "Accessing cryptos",
      cmids: req.query.cmids,
      method: req.method
    })
  })
  .post(function (req, res) {
    res.json({
      message: "Adding new crypto",
      method: req.method
    })
  })
router.route('/cryptos/:cmid')
  .get(function (req, res) {
    res.json({
      message: "Accessing cryptos n" + req.params.cmid,
      method: req.method
    })
  })
  .delete(function (req, res) {
    res.json({
      message: "Deleting crypto n" + req.params.cmid,
      method: req.method
    })
  })
router.route('/cryptos/:cmid/history/:period')
  .get(function (req, res) {
    res.json({
      message: "Get cryptos n" + req.params.cmid + " during the period " + req.params.period,
      method: req.method
    })
  })

module.exports = router