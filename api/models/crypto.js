const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const CryptoSchema = new Schema({
  name: {
    type: String
  },
  id: {
    type: String
  },
  symbol: {
    type: String
  },
  is_authorized: {
    type: Boolean,
    default: false
  },
  is_requested: {
    type: Boolean,
    default: false
  },
  logo: {
    type: {},
    required: false
  },
  actual_price: {
    type: Number,
    required: false,
    default: 0
  },
  lowest_price_day: {
    type: Number,
    required: false,
    default: 0
  },
  highest_price_day: {
    type: Number,
    required: false,
    default: 0
  },
  market_cap: {
    type: Number,
    required: false,
    default: 0
  },
  circulating_supply: {
    type: Number,
    required: false,
    default: 0
  },
  periods: {
    _1d: {
      type: Number,
      required : false,
      default: 0
    },
    last_24h: {
      opening_prices:{
        type: [Number],
        required: false,
        default: [0]
      },
      highest_prices:{
        type: [Number],
        required: false,
        default: [0]
      },
      lowest_prices:{
        type: [Number],
        required: false,
        default: [0]
      },
      closing_rates:{
        type: [Number],
        required: false,
        default: [0]
      }
    },
    last_week: {
      opening_prices:{
        type: [Number],
        required: false,
        default: [0]
      },
      highest_prices:{
        type: [Number],
        required: false,
        default: [0]
      },
      lowest_prices:{
        type: [Number],
        required: false,
        default: [0]
      },
      closing_rates:{
        type: [Number],
        required: false,
        default: [0]
      }
    },
    last_month: {
      opening_prices:{
        type: [Number],
        required: false,
        default: [0]
      },
      highest_prices:{
        type: [Number],
        required: false,
        default: [0]
      },
      lowest_prices:{
        type: [Number],
        required: false,
        default: [0]
      },
      closing_rates:{
        type: [Number],
        required: false,
        default: [0]
      }
    },
  }
});


module.exports = Crypto = mongoose.model("cryptos", CryptoSchema);
