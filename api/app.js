var user_route = require("./routes/user_routes");
var home_route = require("./routes/home_routes");
var crypto_route = require("./routes/crypto_routes")
var express = require('express');
var bodyParser = require('body-parser');
var hostname = 'localhost';
var port = 3000;

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(home_route);
app.use(user_route);
app.use(crypto_route);
app.listen(port, hostname, function () {
  console.log("The app is running on " + hostname + ":" + port + "\n");
});