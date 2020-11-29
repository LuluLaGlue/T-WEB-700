const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const CryptoSchema = new Schema({
  name: {
    type: String
  },
  id: {
    type: String
  },
  is_authorized: {
    type: Boolean,
    default: false
  },
  logo: {
    type: String,
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
  highest_price: {
    type: Number,
    required: false,
    default: 0
  },
  periods: {
    _1h: {
      type: Number,
      required : false,
      default: 0
    },
    _1d: {
      type: Number,
      required : false,
      default: 0
    },
    _7d: {
      type: Number,
      required : false,
      default: 0
    },
    _30d:{
      type: Number,
      required : false,
      default: 0
    },
    daily: {
      opening_price:{
        type: Number,
        required: false,
        default: 0
      },
      highest_price:{
        type: Number,
        required: false,
        default: 0
      },
      lowest_price:{
        type: Number,
        required: false,
        default: 0
      },
      closing_rate:{
        type: Number,
        required: false,
        default: 0
      }
    },
    hourly: {
      opening_price:{
        type: Number,
        required: false,
        default: 0
      },
      highest_price:{
        type: Number,
        required: false,
        default: 0
      },
      lowest_price:{
        type: Number,
        required: false,
        default: 0
      },
      closing_rate:{
        type: Number,
        required: false,
        default: 0
      }
    },
    minute: {
      opening_price:{
        type: Number,
        required: false,
        default: 0
      },
      highest_price:{
        type: Number,
        required: false,
        default: 0
      },
      lowest_price:{
        type: Number,
        required: false,
        default: 0
      },
      closing_rate:{
        type: Number,
        required: false,
        default: 0
      }
    },
  }
});


module.exports = Crypto = mongoose.model("cryptos", CryptoSchema);
