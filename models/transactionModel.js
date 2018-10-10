const mongoose = require("mongoose");
const transactionSchema = mongoose.Schema({
    trans_id: String,
    user_id: String,
    name: String,
    general_name: String,
    amount: Number,
    date: Date,
    is_recurring: Boolean
});

const transactionModel = mongoose.model("transactions", transactionSchema);
module.exports = transactionModel;