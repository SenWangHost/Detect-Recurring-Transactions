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

const recurringGroupSchema = mongoose.Schema({
    name: String,
    general_name: String,
    user_id: String,
    next_amount: Number,
    next_date: Date,
    average_interval: Number,
    interval_std: Number,
    amount_std: Number,
    transactions: [transactionSchema],
    is_recurring: Boolean
});

const recurringGroupModel = mongoose.model("recurring_groups", recurringGroupSchema);
module.exports = recurringGroupModel;