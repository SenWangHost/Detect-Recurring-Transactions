const transactionModel = require("../models/transactionModel");
const recurringGroupModel = require("../models/recurringGroupModel");

/**
 * insert array of new transactions into the transaction collection
 * update the recurring group for recurring group collection 
 */
const insertTransaction = (newTransactions) => {
    return new Promise((resolve, reject) => {
        // update the recurring group based on the new transaction data
        newTransactions.forEach((trans) => {
            recurringGroupModel.findOne({general_name: trans.general_name, user_id: trans.user_id}, (err, group) => {
                if (err) {
                    reject({error: "Error in interacting with database!"});
                } else if (group) {
                    // add the transaction to the group
                    group.all_transactions.push(trans);
                    // recurring group exist, update the recurring group
                    let length = group.all_transactions.length;
                    // the total data point of group needs to be at least 3
                    // for calculation of std
                    if (length >= 3) {
                        let intervals = get_intervals(group.all_transactions);
                        let intervals_std = get_intervals_std(intervals);
                        let amount_std = get_amount_std(group.all_transactions);
                        // if both std meets the criteria, set them as recurring
                        // for this group and each transaction
                        if (intervals_std <= 10.0 && amount_std <= 100.0) {
                            // set each transaction as recurring, also update 
                            // transactions collections
                            group.all_transactions.forEach((trans) => {
                                trans.is_recurring = true;
                                transactionModel.findOne({trans_id: trans.trans_id, user_id: trans.user_id}, (err, result) => {
                                    if (err) {
                                        reject({error: "Error in interacting with database!"});
                                    } else if (result) {
                                        result.set({is_recurring: true});
                                        result.save();
                                    } else {
                                        trans.is_recurring = true;
                                        const temp = new transactionModel(trans);
                                        temp.save();
                                    }
                                });
                            });
                            // set this group to have recurring transactions and
                            // update the field
                            group.has_recurring = true;
                            group.name = trans.name;
                            group.next_amount = get_average_amount(group.all_transactions);
                            group.average_interval = get_intervals_average(intervals);
                            group.interval_std = intervals_std;
                            group.amount_std = amount_std;
                            let most_recent = group.all_transactions[length - 1];
                            group.next_date = new Date(most_recent.date.getTime() + average_interval * 1000 * 3600 * 24);
                            group.transactions = group.all_transactions.slice();
                            group.non_recurring_count = 0;

                        } else {
                            group.non_recurring_count += 1;
                        }
                    } else {
                        group.non_recurring_count += 1;
                    }
                    group.save();
                } else {
                    // create a new recurring group for this user-general_name pair
                    new_recurrring_group = {
                        name: trans.name,
                        general_name: trans.general_name,
                        user_id: trans.user_id,
                        next_amount: trans.amount,
                        next_date: null,
                        average_interval: -1.0,
                        interval_std: -1.0,
                        amount_std: 0.0,
                        non_recurring_count: 1,
                        all_transactions: [trans],
                        transactions: [],
                        has_recurring: false
                    };
                    const rGroup = new recurringGroupModel(new_recurrring_group);
                    rGroup.save();
                    const newTrans = new transactionModel(trans);
                    newTrans.save();
                }
            });
        });
        
        resolve({message: "update recurring group successfully"});
    });
};

/**
 * get the recurring group of one user specified by user_id
 */
const getRecurringGroupsByUser = (user_id) => {

};

/**
 * get all recurring groups
 */
const getAllRecurringGroups = () => {

};

/**
 * helper function for calculating average amount, standard deviation of date
 * and amount
 */
/**
 * use the average amount as the prediction for next amount
 * @param {array of transctions} transactions 
 */
const get_average_amount = (transactions) => {
    let sum = 0;
    // the future sign depends on the most recent transaction
    let sign = transactions[transactions.length - 1].amount < 0 ? -1 : 1;
    transactions.forEach((trans) => {
        sum += Math.abs(trans.amount);
    });
    return sign * sum / transactions.length;
}

/**
 * return an array of time interval in the unit of day
 * @param {Array of transactions} transactions 
 */
const get_intervals = (transactions) => {
    let intervals = [];
    for (let i = 1; i < transactions.length; i++) {
        let interval = (transactions[i].date.getTime() - transactions[i].date.getTime()) / (1000 * 3600 * 24);
        intervals.push(interval);
    }
    console.log(intervals);
    return intervals;
};

/**
 * return the average of interval time
 * @param {Array of float number} intervals 
 */
const get_intervals_average = (intervals) => {
    return math.mean(intervals);
};

/**
 * return the standard deviation of interval time
 * @param {Array of float number} intervals 
 */
const get_intervals_std = (intervals) => {
    return math.std(intervals);
};

/**
 * calculate the standard deviation of amounts
 * @param {Array of transactions} transactions 
 */
const get_amount_std = (transactions) => {
    let amounts = [];
    transactions.forEach((trans) => {amounts.push(math.abs(trans.amount))});
    return math.std(amounts);
};


module.exports = {
    insertTransaction: insertTransaction,
    getRecurringGroupsByUser: getRecurringGroupsByUser,
    getAllRecurringGroups: getAllRecurringGroups
};