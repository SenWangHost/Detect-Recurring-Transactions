const math = require("mathjs");

const transactionModel = require("../models/transactionModel");
const recurringGroupModel = require("../models/recurringGroupModel");

/**
 * save all the transctions to the transactions collection
 */
const insertTransactions = (newTransactions) => {
    return new Promise((resolve, reject) => {
        let groupMap = new Map();
        newTransactions.forEach((trans) => {
            // save every transaction into the database ===> asynchronously
            transactionModel.findOne({trans_id: trans.trans_id, user_id: trans.user_id}, (err, result) => {
                if (err) {
                    reject({error: "Error in saving transactions!"});
                } else if (result) {
                    reject({error: "Duplicate transaction detected!"});
                } else {
                    let curr = new transactionModel(trans);
                    curr.save();
                }
            });
            // group the transactions by general_name and user_id
            let key = trans.general_name + "-" + trans.user_id;
            if (!groupMap.has(key)) {
                groupMap.set(key, []);
            }
            groupMap.get(key).push(trans);
        });
        let promises = [];
        // update each recurring group
        for (let [key, value] of groupMap) {
            let array = key.split('-');
            let g_name = array[0];
            let u_id = array[1];
            console.log(g_name + "--" + u_id);
            console.log(value);
            promises.push(updateRecurringGroup(g_name, u_id, value));
        }
        // executing all asynchronous call before getting the reuslt
        Promise.all(promises).then((values) => {
            resolve(values);
        }).catch((err) => {
            reject(err);
        });
    });
};

const updateRecurringGroup = (g_name, u_id, transactions) => {
    return new Promise((resolve, reject) => {
        recurringGroupModel.findOne({general_name: g_name, user_id: u_id}, (err, group) => {
            if (err) {
                reject({error: "Error in finding recurring group!"}); 
            } else {
                if (!group) {
                    console.log("-->Create new recurring group!");
                    let new_recurring_group = {
                        name: '',
                        general_name: g_name,
                        user_id: u_id,
                        next_amount: 0,
                        next_date: null,
                        average_interval: 0.0,
                        interval_std: 0.0,
                        amount_std: 0.0,
                        transactions: [],
                        is_recurring: false
                    };
                    group = new recurringGroupModel(new_recurring_group);
                }
                console.log("Update recurring group!");
                transactions = transactions.concat(group.transactions);
                transactions.sort((a, b) => {return a.date - b.date});
                let length = transactions.length;
                let most_recent = transactions[length - 1];
                group.transactions = transactions;
                console.log("length: " + length);
                if (length >= 3) {
                    let intervals = get_intervals(transactions);
                    let intervals_std = get_intervals_std(intervals);
                    let intervals_ave = get_intervals_average(intervals);
                    let amount_std = get_amount_std(transactions);
                    let amount_ave = get_average_amount(transactions);
                    console.log("---------");
                    console.log(intervals);
                    console.log("intervals_std = " + intervals_std);
                    console.log("amount_std = " + amount_std);
                    console.log("---------");
                    // if both std meets the criteria, set them as recurring
                    // for this group and each transaction
                    if (intervals_std <= 10.0 && amount_std <= 100.0) {
                        // update this group as recurring group
                        console.log("is recurring group!");
                        group.name = most_recent.name;
                        group.next_amount = amount_ave;
                        console.log(most_recent.date);
                        group.next_date = new Date(most_recent.date.getTime() + intervals_ave * 1000 * 3600 * 24);
                        group.average_interval = intervals_ave;
                        group.interval_std = intervals_std;
                        group.amount_std = amount_std;
                        group.is_recurring = true;
                    }
                }
                group.save();
                resolve(group);
            }
        });
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
        let interval = (transactions[i].date.getTime() - transactions[i - 1].date.getTime()) / (1000 * 3600 * 24);
        intervals.push(interval);
    }
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
    for (let trans of transactions) {
        amounts.push(trans.amount);
    }
    return math.std(amounts);
};


module.exports = {
    insertTransactions: insertTransactions,
    getRecurringGroupsByUser: getRecurringGroupsByUser,
    getAllRecurringGroups: getAllRecurringGroups
};