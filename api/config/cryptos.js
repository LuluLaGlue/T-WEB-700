const mongoose = require("mongoose");
const Crypto = require("../models/crypto");
const fetch = require('node-fetch');
const moment = require('moment');
const CoinGecko = require("coingecko-api");

const CoinGeckoClient = new CoinGecko()

const updateCryptoValues = async crypto => {

    let crypto_tmp = crypto

    let resp_tmp;
    let ohlc_daily = [];
    let ohlc_hourly = [];
    let ohlc_minute = [];

    resp_tmp = await CoinGeckoClient.coins.fetch(crypto_tmp.id, {localization:false, sparkline: false});

    if (resp_tmp.data.market_data.current_price.eur) crypto_tmp.actual_price = resp_tmp.data.market_data.current_price.eur
    if (resp_tmp.data.market_data.price_change_24h) crypto_tmp.periods._1d = resp_tmp.data.market_data.price_change_24h
    if (resp_tmp.data.market_data.high_24h.eur) crypto_tmp.highest_price_day = resp_tmp.data.market_data.high_24h.eur
    if (resp_tmp.data.market_data.low_24h.eur) crypto_tmp.lowest_price_day = resp_tmp.data.market_data.low_24h.eur
    if (resp_tmp.data.market_data.market_cap.eur) crypto_tmp.market_cap = resp_tmp.data.market_data.market_cap.eur
    if (resp_tmp.data.market_data.circulating_supply.eur) crypto_tmp.circulating_supply = resp_tmp.data.market_data.circulating_supply.eur

    let data_day = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=1',{
      method:'GET',
    }).then(resp => resp.json())
      .catch(e => console.log(error))

    crypto_tmp.periods.last_24h.opening_prices = []
    crypto_tmp.periods.last_24h.highest_prices = []
    crypto_tmp.periods.last_24h.lowest_prices = []
    crypto_tmp.periods.last_24h.closing_rates = []

    for (price in data_day){
      crypto_tmp.periods.last_24h.opening_prices.push(data_day[price][1])
      crypto_tmp.periods.last_24h.highest_prices.push(data_day[price][2])
      crypto_tmp.periods.last_24h.lowest_prices.push(data_day[price][3])
      crypto_tmp.periods.last_24h.closing_rates.push(data_day[price][4])
    }
    crypto_tmp.save()

    let data_week = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=7',{
      method:'GET',
    }).then(resp => resp.json())
      .catch(e => console.log(error))

    crypto_tmp.periods.last_week.opening_prices = []
    crypto_tmp.periods.last_week.highest_prices = []
    crypto_tmp.periods.last_week.lowest_prices = []
    crypto_tmp.periods.last_week.closing_rates = []

    for (let i=0;i<data_week.length;i=i+6){
      crypto_tmp.periods.last_week.opening_prices.push(data_week[i][1])
      crypto_tmp.periods.last_week.highest_prices.push(data_week[i][2])
      crypto_tmp.periods.last_week.lowest_prices.push(data_week[i][3])
      crypto_tmp.periods.last_week.closing_rates.push(data_week[i][4])
    }

    let data_monthly = await fetch('https://api.coingecko.com/api/v3/coins/'+crypto_tmp.id+'/ohlc?vs_currency=eur&days=30',{
      method:'GET',
    }).then(resp => resp.json())
      .catch(e => console.log(error))
    crypto_tmp.periods.last_month.opening_prices = []
    crypto_tmp.periods.last_month.highest_prices = []
    crypto_tmp.periods.last_month.lowest_prices = []
    crypto_tmp.periods.last_month.closing_rates = []

    for (let i=0;i<data_monthly.length;i=i+6){
      crypto_tmp.periods.last_month.opening_prices.push(data_monthly[i][1])
      crypto_tmp.periods.last_month.highest_prices.push(data_monthly[i][2])
      crypto_tmp.periods.last_month.lowest_prices.push(data_monthly[i][3])
      crypto_tmp.periods.last_month.closing_rates.push(data_monthly[i][4])
    }

    crypto_tmp.save()

}

const refreshCryptoDB = async () => {

  let resp_tmp = await CoinGeckoClient.coins.all({per_page:200, page:1, localization:false})
                        .catch(error => console.log(error))

  let crypto_list = [];
  let page_number = 1;

  while (resp_tmp.data.length === 200){

    resp_tmp = await CoinGeckoClient.coins.all({per_page:200, page:page_number})
                          .catch(error => console.log(error))

    for(item in resp_tmp){
      let obj = resp_tmp[item]
      if (obj !== undefined){

        for (item_2 in obj){
          let obj_2 = obj[item_2]
            if (obj_2 !== undefined && obj_2.id !== undefined){

              await Crypto.findOne({
                id: obj_2.id
              }).then(async crypto => {
                if (!crypto){
                  let url, id, symbol, name;
                  if (obj_2.image) url = obj_2.image
                  if (obj_2.id) id = obj_2.id
                  if (obj_2.name) name = obj_2.name
                  if (obj_2.symbol) symbol = obj_2.symbol
                  const newCrypto = await new Crypto({
                    id: id,
                    symbol: symbol,
                    name: name,
                    logo: url
                  });
                  newCrypto.save()
                  crypto_list.push(obj_2.id)
                }
              })
              .catch(error => console.log(error))
            }
          }
        }
      }
      page_number++;
    }

  console.log('Crypto DB refreshed '+crypto_list)

  setInterval(refreshCryptoDB, 86400000); // 1 update per 24H
};

const refreshCryptoValues = async () => {

  let crypto_list = [];
  await Crypto.find({
    is_authorized: true
  }).then(async crypto => {
    for (item in crypto){
      updateCryptoValues(crypto[item])
      crypto_list.push(crypto[item].id)
    }
  })
  .catch(error => console.log(error))
  console.log('Crypto values refreshed : '+crypto_list)


  setInterval(refreshCryptoValues, 3600000); // 1 update per hour

};

module.exports = { refreshCryptoDB, refreshCryptoValues, updateCryptoValues }
