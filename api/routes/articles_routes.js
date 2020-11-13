var express = require('express');
var router = express.Router();

router.route('/articles')
  .get(function (req, res) {
    res.json({
      message: "Accessing articles",
      params: req.query.params,
      method: req.method
    })
  })
router.route('/articles/:id')
  .get(function (req, res) {
    res.json({
      message: "Accessing article n" + req.params.id,
      method: req.method
    })
  })

module.exports = router