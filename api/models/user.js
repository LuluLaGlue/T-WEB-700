const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    is_admin: {
        type: Boolean,
        required: true,
        default: false
    }
});


module.exports = User = mongoose.model("users", UserSchema);
