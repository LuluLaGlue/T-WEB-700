const mongoose = require("mongoose");
const Crypto = require("../models/crypto");
const User = require("../models/user");
const fetch = require('node-fetch');
const moment = require('moment');
const jwt = require("jsonwebtoken");
const crypto_update = require('../config/cryptos.js');
const keys = require('../config/keys.js');

var listClients = [];
var listTokens = []
var set_socket;

const socket_manager = (io) => {

  io.on('connection', (socket) => {

    listClients.push(socket)
    listTokens.push({socket: socket.id, token:undefined})

    socket.on('connection', async (message) => {

      let socket_true = false
      for (item in listTokens){
        if (listTokens[item].socket === socket.id){
          if (token !== undefined) listTokens[item]['token'] = message.token;
        }
      }
      let datas = await crypto_update.sendAuthorizedCryptos(message.token).then(resp => resp)
      socket.emit('send_cryptos', {message: 'Cryptos', list:datas, method:'SOCKET'})
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected ' + socket.id)
      var i = listClients.indexOf(socket)
      for (item in listTokens){
        if (listTokens[item].socket === socket.id)
          delete listTokens[item]
      }
      delete listClients[i];

    });

    socket.on('add_crypto', async (message) => {
      try {
        verifiedJwt = jwt.verify(message.token, keys.secretOrKey);
      } catch (e) {
        console.log(e)
        return e
      }
      await User.findOne({
        _id: verifiedJwt.id
      }).then( user => {
        let found = false
        for (item in user.cryptos){
          if (user.cryptos[item] === message.crypto_id){
            found = true;
          }
        }
        if (found === false){
          user.cryptos.push(message.crypto_id);
          user.save();
        }
      })
    })

    socket.on('remove_crypto', async (message) => {
      try {
        verifiedJwt = jwt.verify(message.token, keys.secretOrKey);
      } catch (e) {
        console.log(e)
        return e
      }
      await User.findOne({
        _id: verifiedJwt.id
      }).then( user => {
        var i = user.cryptos.indexOf(message.crypto_id);
        delete user.cryptos[i]
        user.save();
      })
    })

    socket.on('request_crypto', async (message) => {
      try {
        verifiedJwt = jwt.verify(message.token, keys.secretOrKey);
      } catch (e) {
        console.log(e)
        return e
      }

      await Crypto.findOne({
        id: message.crypto_id
      }).then( crypto => {
        crypto.is_requested = true;
        crypto.save()
      })
    })


    // Should be call api per period
    socket.on('request_period', async (message) => {
      /*try {
        verifiedJwt = jwt.verify(message.token, keys.secretOrKey);
      } catch (e) {
        console.log(e)
        return e
      }*/

      let datas = await Crypto.find({$or:[{id: new RegExp('^'+message.crypto, 'i') }, {name: new RegExp('^'+message.crypto, 'i')}]
      }).then(resp => resp)

      socket.emit('send_period', {message: 'Search', list:datas, method:'SOCKET'})
    })

    socket.on('ask_search', async (input) => {
      if (input.length>2){
        let datas = await Crypto.find({$or:[{id: new RegExp('^'+input, 'i') }, {name: new RegExp('^'+input, 'i')}]
        }).then(resp => resp)
        socket.emit('get_search', {message: 'Search', list:datas, method:'SOCKET'})
      }
    })

    console.log('Client connected ' + socket.id)

    /* Sockets to do :
    -Request per period
    -Conversion usd/eur/other + period

    */

  })

  setInterval( async () => {
    await crypto_update.refreshCryptoValues();
    for (item in listTokens){
      for (key in listClients){
        if (listClients[key].connected === false){
          delete listClients[key]
        }
        else if (listTokens[item] && listClients[key].id === listTokens[item].socket){
          let datas = await crypto_update.sendAuthorizedCryptos(listTokens[item].token).then(resp => resp)
          if (datas.name)
            datas = await crypto_update.sendAuthorizedCryptos(undefined).then(resp => resp)
          listClients[key].emit('refresh_cryptos', {message: 'Cryptos', list:datas, method:'SOCKET'})
        }
      }
    }

    console.log('Cryptos update sent to sockets')
  }, 15000)
}

module.exports = {socket_manager}
