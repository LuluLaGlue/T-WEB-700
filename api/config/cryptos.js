const mongoose = require("mongoose");
const Crypto = require("../models/crypto");
const fetch = require("node-fetch");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys.js");

const updateCryptoValues = async (crypto) => {
  let crypto_tmp = crypto;

  let euros = await fetch("http://api.coincap.io/v2/rates/euro", {
    method: "GET",
  })
    .then((resp) => resp.json())
    .catch((e) => {});

  let rateUsd;
  if (euros && euros.data) rateUsd = parseFloat(euros.data.rateUsd);

  let resp_tmp = await fetch(
    "http://api.coincap.io/v2/assets?ids=" + crypto_tmp.id,
    {
      method: "GET",
    }
  )
    .then((resp) => resp.json())
    .catch((e) => {});

  if (euros && euros.data && rateUsd) {
    if (resp_tmp && resp_tmp.data) {
      crypto_tmp.actual_price = parseFloat(resp_tmp.data[0].priceUsd) / rateUsd;
      crypto_tmp.market_cap =
        parseFloat(resp_tmp.data[0].marketCapUsd) / rateUsd;
      crypto_tmp.rank = parseInt(resp_tmp.data[0].rank);
      crypto_tmp.circulating_supply = parseFloat(resp_tmp.data[0].supply);
      crypto_tmp.price_change_24h = parseFloat(
        resp_tmp.data[0].changePercent24Hr
      );
    }

    let test_tmp = await fetch(
      "http://api.coincap.io/v2/candles?exchange=bitfinex&interval=m1&baseId=" +
        crypto_tmp.id +
        "&quoteId=united-states-dollar",
      {
        method: "GET",
      }
    )
      .then((resp) => resp.json())
      .catch((e) => {});
    if (test_tmp && test_tmp.data) {
      crypto_tmp.periods.last_2h.opening_prices = [];
      crypto_tmp.periods.last_2h.highest_prices = [];
      crypto_tmp.periods.last_2h.lowest_prices = [];
      crypto_tmp.periods.last_2h.closing_rates = [];
      if (test_tmp.data.length > 120)
        for (i = test_tmp.data.length - 120; i < test_tmp.data.length; i++) {
          crypto_tmp.periods.last_2h.opening_prices.push(
            parseFloat(test_tmp.data[i].open) / rateUsd
          );
          crypto_tmp.periods.last_2h.highest_prices.push(
            parseFloat(test_tmp.data[i].high) / rateUsd
          );
          crypto_tmp.periods.last_2h.lowest_prices.push(
            parseFloat(test_tmp.data[i].low) / rateUsd
          );
          crypto_tmp.periods.last_2h.closing_rates.push(
            parseFloat(test_tmp.data[i].close) / rateUsd
          );
        }
    }

    test_tmp = [];
    test_tmp = await fetch(
      "http://api.coincap.io/v2/candles?exchange=bitfinex&interval=h1&baseId=" +
        crypto_tmp.id +
        "&quoteId=united-states-dollar",
      {
        method: "GET",
      }
    )
      .then((resp) => resp.json())
      .catch((e) => {});
    if (test_tmp && test_tmp.data) {
      crypto_tmp.periods.last_48h.opening_prices = [];
      crypto_tmp.periods.last_48h.highest_prices = [];
      crypto_tmp.periods.last_48h.lowest_prices = [];
      crypto_tmp.periods.last_48h.closing_rates = [];
      if (test_tmp.data.length > 48)
        for (i = test_tmp.data.length - 48; i < test_tmp.data.length; i++) {
          crypto_tmp.periods.last_48h.opening_prices.push(
            parseFloat(test_tmp.data[i].open) / rateUsd
          );
          crypto_tmp.periods.last_48h.highest_prices.push(
            parseFloat(test_tmp.data[i].high) / rateUsd
          );
          crypto_tmp.periods.last_48h.lowest_prices.push(
            parseFloat(test_tmp.data[i].low) / rateUsd
          );
          crypto_tmp.periods.last_48h.closing_rates.push(
            parseFloat(test_tmp.data[i].close) / rateUsd
          );
        }

      crypto_tmp.periods.last_24h.opening_prices = [];
      crypto_tmp.periods.last_24h.highest_prices = [];
      crypto_tmp.periods.last_24h.lowest_prices = [];
      crypto_tmp.periods.last_24h.closing_rates = [];

      if (test_tmp.data.length > 24)
        for (i = test_tmp.data.length - 24; i < test_tmp.data.length; i++) {
          crypto_tmp.periods.last_24h.opening_prices.push(
            parseFloat(test_tmp.data[i].open) / rateUsd
          );
          crypto_tmp.periods.last_24h.highest_prices.push(
            parseFloat(test_tmp.data[i].high) / rateUsd
          );
          crypto_tmp.periods.last_24h.lowest_prices.push(
            parseFloat(test_tmp.data[i].low) / rateUsd
          );
          crypto_tmp.periods.last_24h.closing_rates.push(
            parseFloat(test_tmp.data[i].close) / rateUsd
          );
        }
    }

    test_tmp = [];
    test_tmp = await fetch(
      "http://api.coincap.io/v2/candles?exchange=bitfinex&interval=d1&baseId=" +
        crypto_tmp.id +
        "&quoteId=united-states-dollar",
      {
        method: "GET",
      }
    )
      .then((resp) => resp.json())
      .catch((e) => {});
    if (test_tmp && test_tmp.data) {
      crypto_tmp.periods.last_month.opening_prices = [];
      crypto_tmp.periods.last_month.highest_prices = [];
      crypto_tmp.periods.last_month.lowest_prices = [];
      crypto_tmp.periods.last_month.closing_rates = [];

      if (test_tmp.data.length > 0) {
        crypto_tmp.lowest_price_day =
          parseFloat(test_tmp.data[test_tmp.data.length - 1].low) / rateUsd;
        crypto_tmp.highest_price_day =
          parseFloat(test_tmp.data[test_tmp.data.length - 1].high) / rateUsd;
      } else {
        crypto_tmp.lowest_price_day = 0;
        crypto_tmp.highest_price_day = 0;
      }
      if (test_tmp.data.length > 30)
        for (i = test_tmp.data.length - 30; i < test_tmp.data.length; i++) {
          crypto_tmp.periods.last_month.opening_prices.push(
            parseFloat(test_tmp.data[i].open) / rateUsd
          );
          crypto_tmp.periods.last_month.highest_prices.push(
            parseFloat(test_tmp.data[i].high) / rateUsd
          );
          crypto_tmp.periods.last_month.lowest_prices.push(
            parseFloat(test_tmp.data[i].low) / rateUsd
          );
          crypto_tmp.periods.last_month.closing_rates.push(
            parseFloat(test_tmp.data[i].close) / rateUsd
          );
        }

      crypto_tmp.periods.last_week.opening_prices = [];
      crypto_tmp.periods.last_week.highest_prices = [];
      crypto_tmp.periods.last_week.lowest_prices = [];
      crypto_tmp.periods.last_week.closing_rates = [];
      if (test_tmp.data.length > 7)
        for (i = test_tmp.data.length - 7; i < test_tmp.data.length; i++) {
          crypto_tmp.periods.last_week.opening_prices.push(
            parseFloat(test_tmp.data[i].open) / rateUsd
          );
          crypto_tmp.periods.last_week.highest_prices.push(
            parseFloat(test_tmp.data[i].high) / rateUsd
          );
          crypto_tmp.periods.last_week.lowest_prices.push(
            parseFloat(test_tmp.data[i].low) / rateUsd
          );
          crypto_tmp.periods.last_week.closing_rates.push(
            parseFloat(test_tmp.data[i].close) / rateUsd
          );
        }

      crypto_tmp.periods.last_60d.opening_prices = [];
      crypto_tmp.periods.last_60d.highest_prices = [];
      crypto_tmp.periods.last_60d.lowest_prices = [];
      crypto_tmp.periods.last_60d.closing_rates = [];
      if (test_tmp.data.length > 60)
        for (i = test_tmp.data.length - 60; i < test_tmp.data.length; i++) {
          crypto_tmp.periods.last_60d.opening_prices.push(
            parseFloat(test_tmp.data[i].open) / rateUsd
          );
          crypto_tmp.periods.last_60d.highest_prices.push(
            parseFloat(test_tmp.data[i].high) / rateUsd
          );
          crypto_tmp.periods.last_60d.lowest_prices.push(
            parseFloat(test_tmp.data[i].low) / rateUsd
          );
          crypto_tmp.periods.last_60d.closing_rates.push(
            parseFloat(test_tmp.data[i].close) / rateUsd
          );
        }
    }
    crypto_tmp.save();
  }
};

const refreshCryptoDB = async () => {
  let coincap_datas = await fetch(
    "http://api.coincap.io/v2/assets?limit=200&offset=0",
    {
      method: "GET",
    }
  ).then((resp) => resp.json());
  let offset = 0;
  let crypto_list = [];

  while (coincap_datas.data.length === 200) {
    console.log(coincap_datas.data.length, offset);
    coincap_datas = await fetch(
      "http://api.coincap.io/v2/assets?limit=200&offset=" + offset,
      {
        method: "GET",
      }
    ).then((resp) => resp.json());

    for (item in coincap_datas.data) {
      await Crypto.findOne({
        $or: [
          { id: coincap_datas.data[item].id },
          { name: coincap_datas.data[item].name },
          { name: coincap_datas.data[item].symbol },
        ],
      }).then(async (crypto) => {
        if (!crypto) {
          let id, symbol, name, rank;
          let url =
            "https://static.coincap.io/assets/icons/" +
            coincap_datas.data[item].symbol.toLowerCase() +
            "@2x.png";
          if (coincap_datas.data[item].rank)
            rank = parseInt(coincap_datas.data[item].rank);
          if (coincap_datas.data[item].id) id = coincap_datas.data[item].id;
          if (coincap_datas.data[item].name)
            name = coincap_datas.data[item].name;
          if (coincap_datas.data[item].symbol)
            symbol = coincap_datas.data[item].symbol;
          const newCrypto = await new Crypto({
            id: id,
            symbol: symbol,
            name: name,
            logo: url,
            rank: rank,
          });
          await newCrypto.save();
          crypto_list.push(id);
        }
      });
    }

    offset = offset + coincap_datas.data.length;
  }

  console.log("Crypto DB refreshed " + crypto_list);

  setInterval(refreshCryptoDB, 86400000); // 1 update per 24H
};

const refreshCryptoValues = async () => {
  let crypto_list = [];
  await Crypto.find({
    is_authorized: true,
  })
    .then(async (crypto) => {
      console.log(crypto.length);
      for (item in crypto) {
        updateCryptoValues(crypto[item]);
        crypto_list.push(crypto[item].id);
      }
    })
    .catch((error) => console.log(error));
  console.log("Crypto values refreshed : " + crypto_list);

  //setInterval(refreshCryptoValues, 3600000); // 1 update per hour
};

const sendAuthorizedCryptos = async (token) => {
  if (token === undefined) {
    let datas = await Crypto.find(
      {
        is_authorized: true,
      },
      null,
      { sort: { rank: 1 } }
    )
      .then((crypto) => {
        return crypto;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
    return datas;
  } else {
    let verifiedJwt = "";
    try {
      verifiedJwt = jwt.verify(token, keys.secretOrKey);
    } catch (e) {
      let datas = await Crypto.find(
        {
          is_authorized: true,
        },
        null,
        { sort: { rank: 1 } }
      )
        .then((crypto) => {
          return crypto;
        })
        .catch((err) => {
          console.log(err);
          return null;
        });
      return datas;
    }

    let user_tmp;
    let crypto_followed = [];
    let crypto_else = [];

    await User.findOne({
      _id: verifiedJwt.id,
    }).then((user) => {
      user_tmp = user;
    });
    for (item in user_tmp.cryptos) {
      let obj = user_tmp.cryptos[item];
      await Crypto.findOne({ $and: [{ id: obj }, { is_authorized: true }] })
        .then(async (crypto) => {
          if (crypto) crypto_followed.push(crypto);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    let cryptos = await Crypto.find(
      {
        is_authorized: true,
      },
      null,
      { sort: { rank: 1 } }
    )
      .then(async (crypto) => {
        for (item in crypto) {
          let found = false;
          for (key in crypto_followed) {
            if (crypto_followed[key].name === crypto[item].name) {
              found = true;
            }
          }
          if (!found) {
            crypto_else.push(crypto[item]);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
    return { followed: crypto_followed, else: crypto_else };
  }
};

const toUsdRate = async (crypto) => {
  let euros = await fetch("http://api.coincap.io/v2/rates/euro", {
    method: "GET",
  })
    .then((resp) => resp.json())
    .catch((e) => {});

  let rateUsd = parseFloat(euros.data.rateUsd);

  let datas = await Crypto.findOne({
    id: crypto.id,
  }).then((crypto) => {
    let crypto_tmp = crypto;
    crypto_tmp.actual_price = crypto_tmp.actual_price * rateUsd;
    crypto_tmp.lowest_price_day = crypto_tmp.lowest_price_day * rateUsd;
    crypto_tmp.highest_price_day = crypto_tmp.highest_price_day * rateUsd;

    if (crypto_tmp.periods.last_24h.length > 0) {
      for (item in crypto_tmp.periods.last_24h) {
        crypto_tmp.periods.last_24h[item] =
          crypto_tmp.periods.last_24h[item] * rateUsd;
      }
    }
    if (crypto_tmp.periods.last_week.length > 0) {
      for (item in crypto_tmp.periods.last_week) {
        crypto_tmp.periods.last_week[item] =
          crypto_tmp.periods.last_week[item] * rateUsd;
      }
    }
    if (crypto_tmp.periods.last_month.length > 0) {
      for (item in crypto_tmp.periods.last_month) {
        crypto_tmp.periods.last_month[item] =
          crypto_tmp.periods.last_month[item] * rateUsd;
      }
    }
    if (crypto_tmp.periods.last_2h.length > 0) {
      for (item in crypto_tmp.periods.last_2h) {
        crypto_tmp.periods.last_2h[item] =
          crypto_tmp.periods.last_2h[item] * rateUsd;
      }
    }
    if (crypto_tmp.periods.last_48h.length > 0) {
      for (item in crypto_tmp.periods.last_48h) {
        crypto_tmp.periods.last_48h[item] =
          crypto_tmp.periods.last_48h[item] * rateUsd;
      }
    }
    if (crypto_tmp.periods.last_60d.length > 0) {
      for (item in crypto_tmp.periods.last_60d) {
        crypto_tmp.periods.last_60d[item] =
          crypto_tmp.periods.last_60d[item] * rateUsd;
      }
    }

    return crypto_tmp;
  });
  return datas;
};

module.exports = {
  refreshCryptoDB,
  refreshCryptoValues,
  updateCryptoValues,
  sendAuthorizedCryptos,
  toUsdRate,
};
