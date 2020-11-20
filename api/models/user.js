const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const UserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    default: "username"
  },
  password: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: "user"
  },
  articles: {
    type: Array,
    default: []
  },
  dark_mode: {
    type: Boolean,
    required: true,
    default: false
  }
});


module.exports = User = mongoose.model("users", UserSchema);