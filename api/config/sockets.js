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
    listTokens.push({socket: socket.id, token:undefined, rate:'eur'})

    console.log(listTokens)

    socket.on('connection', async (message) => { // On window refresh
      let token = undefined;
      if (message.token) token = message.token
      let socket_true = false
      for (item in listTokens){
        if (listTokens[item].socket === socket.id){
          if (token !== undefined) listTokens[item]['token'] = message.token;
        }
      }
      let datas = await crypto_update.sendAuthorizedCryptos(token).then(resp => resp)
      if (datas.followed) socket.emit('send_cryptos', {message: 'Cryptos', list:datas.else, followed: datas.followed, method:'SOCKET'})
      else socket.emit('send_cryptos', {message: 'Cryptos', list:datas, method:'SOCKET'})
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

    socket.on('add_crypto', async (message) => { // User profil update
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

    socket.on('remove_crypto', async (message) => { // User profil update
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

    socket.on('request_crypto', async (message) => { // For users
      try {
        verifiedJwt = jwt.verify(message.token, keys.secretOrKey);
      } catch (e) {
        console.log(e)
        return e
      }

      await Crypto.findOne({
        id: message.crypto_id
      }).then( crypto => {
        if (crypto.is_authorized = false){
          crypto.is_requested = true;
          crypto.save()
        }
      })
    })

    socket.on('ask_search', async (input) => { // For users or admin
      if (input.length>2){
        let datas = await Crypto.find({$or:[{id: new RegExp('^'+input, 'i') }, {name: new RegExp('^'+input, 'i')}, {symbol: new RegExp('^'+input, 'i')}]
        }).then(resp => resp)
        socket.emit('send_authorized', {message: 'Search', list:datas, method:'SOCKET'})
      }
    })

    socket.on('ask_authorized', async (input) => { // For users or admin
      if (input.length>2){
        let datas = await Crypto.find({$and:[{is_authorized:true},{$or:[{id: new RegExp('^'+input, 'i') }, {name: new RegExp('^'+input, 'i')}, {symbol: new RegExp('^'+input, 'i')}]}]
        }).then(resp => resp)
        socket.emit('get_authorized', {message: 'Authorized', list:datas, method:'SOCKET'})
      }
    })

    socket.on('request_period', async (message) => { // For users
      try {
        verifiedJwt = jwt.verify(message.token, keys.secretOrKey);
      } catch (e) {
        console.log(e)
        return e
      }

      await Crypto.findOne({
        id: message.crypto_id
      }).then( crypto => {
        socket.emit('send_period', {message: 'Period', list:crypto.periods[message.period], method:'SOCKET'})
      })
    })

    socket.on('change_rate', async (message) => { // For users
      let i;
      for (item in listTokens){
        if (listTokens[item].id = socket.id){
          listTokens[item]['rate'] = message.rate
          i = item;
          break;
        }
      }
      if (message.rate === 'eur'){
        let datas = await crypto_update.sendAuthorizedCryptos(message.token).then(resp => resp)
        socket.emit('refresh_cryptos', {message: 'RateEur', list:datas, method:'SOCKET'})
      }
      else if (message.rate === 'usd'){

        let datas = await crypto_update.sendAuthorizedCryptos(message.token).then(resp => resp)
        let crypto_usd = []
        for (item in datas){
          crypto_usd.push(toUsdRate(datas.item))
        }
        socket.emit('refresh_cryptos', {message: 'RateUsd', list:crypto_usd, method:'SOCKET'})
      }
    })

    socket.on('specific_crypto', async (message) => {
      let datas = await Crypto.findOne({
        id: message.id
      }).then(resp => resp)
      socket.emit('send_specific', {message: 'Specific', list:datas, method:'SOCKET'})
    })

    console.log('Client connected ' + socket.id)

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
          if (datas.name) datas = await crypto_update.sendAuthorizedCryptos(undefined).then(resp => resp)

          let list = []
          console.log(listTokens[0].rate)
          if (listTokens[item].rate === 'usd'){
            for (item in datas){
                list.push(toUsdRate(datas[item]))
              }
              listClients[key].emit('refresh_cryptos', {message: 'Cryptos', list:list, method:'SOCKET'})
          }
          else listClients[key].emit('refresh_cryptos', {message: 'Cryptos', list:datas, method:'SOCKET'})
        }
      }
    }

    console.log('Cryptos update sent to sockets')
  }, 15000)
}

module.exports = {socket_manager}
