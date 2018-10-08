const transactionModel = require("../models/transactionModel");

/**
 * insert array of new transactions into the transaction collection
 * update the recurring group for recurring group collection 
 */
const insertTransaction = (newTransactions) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({message: "some message"});
        }, 1000*10);
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

module.exports = {
    insertTransaction: insertTransaction,
    getRecurringGroupsByUser: getRecurringGroupsByUser,
    getAllRecurringGroups: getAllRecurringGroups
};