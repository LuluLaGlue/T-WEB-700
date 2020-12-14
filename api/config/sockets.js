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

  io.on('connection', async (socket) => {

    listClients.push({socket: socket, token:undefined, rates:'eur'})

    await socket.on('connection', async (message) => { // On window refresh
      let token;
      if (message.token === 'undefined' ) token = undefined
      else token = message.token

      let datas = await crypto_update.sendAuthorizedCryptos(token).then(resp => resp).catch(e => {})
      if (datas.name) datas = await crypto_update.sendAuthorizedCryptos(undefined).then(resp => resp).catch(e => {})
      let list = []
      if (datas.followed) {
        socket.emit('send_cryptos', {message: 'Cryptos', list:datas.else, followed: datas.followed, method:'SOCKET'})
      }
      else socket.emit('send_cryptos', {message: 'Cryptos', list:datas, method:'SOCKET'})

      for (item in listClients){
        if (listClients[item].socket.id === socket.id){
          listClients[item]['token'] = token
        }
      }

      /*let interval = setInterval( async (arg) => {
        let token;
        if (arg.temp.token === 'undefined' ) token = undefined
        else token = arg.temp.token
        let datas = await crypto_update.sendAuthorizedCryptos(arg.temp.token).then(resp => resp).catch(e => {})
        if (datas.name) datas = await crypto_update.sendAuthorizedCryptos(undefined).then(resp => resp).catch(e => {})
        let list = []
        if (datas.followed) {
          socket.emit('send_cryptos', {message: 'Cryptos', list:datas.else, followed: datas.followed, method:'SOCKET'})
        }
        else socket.emit('send_cryptos', {message: 'Cryptos', list:datas, method:'SOCKET'})

        console.log('Cryptos update sent to sockets')
      }, 15000, ({socket:socket, temp:temp_message}))
      */

      /*let token = undefined;
      let rates = 'eur';

      if (message.token === 'undefined') token = undefined;
      else if (message.token !== undefined) token = message.token;

      if (message.rates !== undefined && message.rates !== null) rates = message.rates;
      else rates = 'eur'

      let newSocket = {socket:socket, token: token, rates: rates}
      if (listTokens.length>0){
        for(item in listTokens){
          if(listTokens[item].socket === socket.id){
            listTokens.splice(item,1)
            break;
          }
        }
      }
      listTokens.push(newSocket)
      setInterval
      let datas = await crypto_update.sendAuthorizedCryptos(token).then(resp => resp).catch(e =>{})
      if (datas.followed) {
        socket.emit('send_cryptos', {message: 'Cryptos', list:datas.else, followed: datas.followed, method:'SOCKET'})
      }
      else socket.emit('send_cryptos', {message: 'Cryptos', list:datas, method:'SOCKET'})*/
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected ' + socket.id)
      var i = listClients.indexOf(socket)
      listClients.splice(i,1);

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
      if (found){
        socket.emit('added_crypto', {message: 'Already added', list:crypto_id, method:'SOCKET'})
      }
      else {
        let datas = await crypto_update.sendAuthorizedCryptos(listClients[item].token).then(resp => resp).catch(e => {})
        socket.emit('added_crypto', {message: 'Crypto added', list:datas.else, followed:datas.followed, crypto_id:message.crypto_id, method:'SOCKET'})
      }
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
        user.cryptos.splice(i, 1)
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
        if (crypto.is_authorized === false){
          crypto.is_requested = true;
          crypto.save()
        }
      })
    })

    socket.on('ask_search', async (input) => { // For users or admin
      if (input.length>2){
        let datas = await Crypto.find({$and:[{is_authorized:false},{$or:[{id: new RegExp('^'+input, 'i') }, {name: new RegExp('^'+input, 'i')}, {symbol: new RegExp('^'+input, 'i')}]}]
        }).then(resp => resp)
        socket.emit('get_request', {message: 'Search', list:datas, method:'SOCKET'})
      }
    })

    socket.on('ask_authorized', async (input) => { // For users or admin
      if (input.length>2){
        let datas = await Crypto.find({$and:[{is_authorized:true},{$or:[{id: new RegExp('^'+input, 'i') }, {name: new RegExp('^'+input, 'i')}, {symbol: new RegExp('^'+input, 'i')}]}]
        }).then(resp => resp)
        socket.emit('get_search', {message: 'Search', list:datas, method:'SOCKET'})
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
      for (item in listClients){
        if (listClients[item].id = socket.id){
          listClients[item]['rate'] = message.rate
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

    socket.on('to_authorized', async (message) => {
      try {
        verifiedJwt = jwt.verify(message.token, keys.secretOrKey);
      } catch (e) {
        console.log(e)
        return e
      }
      if (verifiedJwt.role !== "admin") {
        socket.emit("accept_authorized", { message: "unauthorized", error: "token not valid" })
      }
      else {
        let datas = await Crypto.findOne({
          id: message.id
        }).then(cryptos => {let crypto_tmp = cryptos
                            crypto_tmp.is_authorized=true
                            crypto_tmp.save()})
                            datas = await Crypto.find({
                              is_authorized: true
                            })
          .then(cryptos => cryptos)
        socket.emit('accept_authorized', {message: 'Accepted', list:datas, method:'SOCKET'})
      }
    })

    socket.on('requested_crypto', async (message) => {
      let datas = await Crypto.findOne({
        id: message.id
      }).then(resp => resp)
      socket.emit('send_specific', {message: 'Specific', list:datas, method:'SOCKET'})
    })

    console.log('Client connected ' + socket.id)

  })

  setInterval( async () => {
    await crypto_update.refreshCryptoValues();
    for (item in listClients){
      let socket = listClients[item].socket
      let datas = await crypto_update.sendAuthorizedCryptos(listClients[item].token).then(resp => resp).catch(e => {})
      if (datas.name) datas = await crypto_update.sendAuthorizedCryptos(undefined).then(resp => resp).catch(e => {})
      let list = []
      if (datas.followed) {
        socket.emit('send_cryptos', {message: 'Cryptos', list:datas.else, followed: datas.followed, method:'SOCKET'})
      }
      else socket.emit('send_cryptos', {message: 'Cryptos', list:datas, method:'SOCKET'})
    }
    console.log('Cryptos update sent to sockets')
  }, 15000)
}

module.exports = {socket_manager}
