const mongoose = require("mongoose");
const Crypto = require("../models/crypto");
const fetch = require('node-fetch');
const moment = require('moment');
//const CoinGecko = require("coingecko-api");

//const CoinGeckoClient = new CoinGecko()

const refreshCryptoDB = async () => {

  //let print = await CoinGeckoClient.coins.fetch('bitcoin', {})

  //console.log(print.data)

  /*for(item in resp_tmp){
    let obj = resp_tmp[item]

    await Crypto.findOne({
      id: obj.id
    }).then(async crypto => {
      if (!crypto){
        const newCrypto = new Crypto({
          id: obj.id,
          name: obj.name
        });
        newCrypto.save()
      }
    })
  }*/
  console.log('Crypto DB refreshed')

  /*let resp_tmp;
  resp_tmp = await fetch(process.env.CRYPTO_API+'/currencies?key='+process.env.CRYPTO_KEY,{
    method:'GET',
  })
  .then(resp => resp.json())
  .catch(e => console.log(e))

  for(item in resp_tmp){
    let obj = resp_tmp[item]

    await Crypto.findOne({
      id: obj.id
    }).then(async crypto => {
      if (!crypto){
        const newCrypto = new Crypto({
          id: obj.id,
          name: obj.name
        });
        newCrypto.save()
      }
    })
  }
  console.log('Crypto DB refreshed')

  setInterval(refreshCryptoDB, 86400000); // 1 update per 24H*/
};

const refreshCryptoValues = async () => {

  let crypto_list = [];
  await Crypto.find({
    is_authorized: true
  }).then(async crypto => {
    for (item in crypto){
      let resp_tmp;
      resp_tmp = await fetch(process.env.CRYPTO_API+'/currencies/ticker?key='+process.env.CRYPTO_KEY+'&ids='+crypto[item].id+'&convert=EUR&interval=1h,1d,7d,30d&per-page=100&page=1',{
        method:'GET',
      })
      .then(resp => resp.json())
      .catch(e => console.log(e))

      if (resp_tmp[0].price) crypto[item].actual_price = resp_tmp[0].price
      if (resp_tmp[0].high) crypto[item].highest_price = resp_tmp[0].high
      if (resp_tmp[0]._1h) crypto[item].periods._1h = resp_tmp[0]['1h'].price_change
      if (resp_tmp[0]._1d) crypto[item].periods._1d = resp_tmp[0]['1d'].price_change
      if (resp_tmp[0]._7d) crypto[item].periods._7d = resp_tmp[0]['7d'].price_change
      if (resp_tmp[0]._30d) crypto[item].periods._30d = resp_tmp[0]['30d'].price_change
      crypto[item].save()
      crypto_list.push(crypto[item].id)
    }
  })
  .catch(error => console.log(error))
  console.log('Crypto values refreshed : '+crypto_list)


  setInterval(refreshCryptoValues, 3600000); // 1 update per hour

};

module.exports = { refreshCryptoDB, refreshCryptoValues }
