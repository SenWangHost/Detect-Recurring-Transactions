const mongoose = require("mongoose");
const transactionSchema = mongoose.Schema({
    trans_id: String,
    user_id: String,
    name: String,
    amount: Number,
    date: Date,
    year: Number,
    month: Number,
    day: Number,
    general_name: String
});

const transactionModel = mongoose.model("transactions", transactionSchema);
module.exports = transactionModel;