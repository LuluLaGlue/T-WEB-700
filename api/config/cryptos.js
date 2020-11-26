const mongoose = require("mongoose");
const Crypto = require("../models/crypto");
const fetch = require('node-fetch');

const refreshCryptoDB = async () => {

  let resp_tmp;
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

  setInterval(refreshCryptoDB, 86400000); // 1 update per 24H
};

const refreshCryptoValues = async () => {

  await Crypto.findOne({
    is_authorized: true
  }).then(async crypto => {
    let resp_tmp;
    resp_tmp = await fetch(process.env.CRYPTO_API+'/currencies/ticker?key='+process.env.CRYPTO_KEY+'&ids='+crypto.id+'&interval=1h,1d,7d,30d&per-page=100&page=1',{
      method:'GET',
    })
    .then(resp => resp.json())
    .catch(e => console.log(e))

    crypto.is_authorized = true;
    crypto.actual_price = resp_tmp[0].price
    crypto.highest_price = resp_tmp[0].high
    crypto.price_change._1h = resp_tmp[0]['1h'].price_change
    crypto.price_change._1d = resp_tmp[0]['1d'].price_change
    crypto.price_change._7d = resp_tmp[0]['7d'].price_change
    crypto.price_change._30d = resp_tmp[0]['30d'].price_change
    crypto.save()
  })
  console.log('Crypto values refreshed')

  setInterval(refreshCryptoValues, 3600000); // 1 update per hour
};

module.exports.refreshCryptoDB = refreshCryptoDB
module.exports.refreshCryptoValues = refreshCryptoValues
