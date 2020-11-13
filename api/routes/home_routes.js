var express = require('express');
var router = express.Router();

router.route('/')
  .all(function (req, res) {
    res.json({
      message: "Home Page",
      method: req.method
    });
  })
module.exports = router