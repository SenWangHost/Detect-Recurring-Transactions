const transactionModel = require("../models/transactionModel");

/**
 * insert array of new transactions into the transaction collection
 * update the recurring group for recurring group collection 
 */
const insertTransaction = (newTransactions) => {
    return new Promise((resolve, reject) => {
        // save each transaction into the transaction model
        newTransactions.forEach((transaction) => {
            transactionModel.findOne({trans_id: transaction.trans_id, user_id: transaction.user_id}, (err, result) => {
                if (err) {
                    reject({error: "Error in connecting with database!"});
                } else if (result) {
                    reject({error: "Transaction data already exists!"});
                } else {
                    // save to the database
                    let curr = transactionModel(transaction);
                    curr.save();
                }
            });
        });
        // update the recurring_groups
        
        resolve({message: "Transactions added successfully!"});
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