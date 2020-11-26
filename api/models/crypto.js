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
  highest_price: {
    type: Number,
    required: false,
    default: 0
  },
  price_change: {
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
    }
  }
});


module.exports = Crypto = mongoose.model("cryptos", CryptoSchema);
