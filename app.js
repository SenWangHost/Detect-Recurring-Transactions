const zmq = require('zeromq');
//connect to mongodb using mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/interview_challenge', {useNewUrlParser:true});

const transctionService = require("./services/transactionService");
// socket to talk to clients
const responder = zmq.socket('rep');

// console.log(responder);
// listen for request
responder.on('message', (request) => {
    console.log("Received request: [" + request.toString() + "]");
    let reqObject = JSON.parse(request.toString());
    // console.log(reqObject);
    let timeout = true;
    switch(reqObject.task) {
        case "upsert_transactions":
            // valid the input transaction format
            if (reqObject.transactions && Array.isArray(reqObject.transactions)) {
                // convert the input transaction format into the schema format
                let transactions = reqObject.transactions;
                transactions.forEach((trans) => {convertTransaction(trans)});
                transctionService.insertTransactions(transactions).then((result) => {
                    console.log(result);
                    responder.send(JSON.stringify(result));
                    timeout = false;
                }, (err) => {
                    responder.send(JSON.stringify(err));
                    timeout = false;
                });
            } else {
                responder.send(JSON.stringify({error: "Invalid input format for transactions!"}));
                timeout = false;
            }
            break;
        case "get_recurring_trans":
            transctionService.getAllRecurringGroups().then((groups) => {
                for (let i = 0; i < groups.length; i++) {
                    groups[i] = clean_group(groups[i]);
                }
                responder.send(JSON.stringify(groups));
            }, (err) => {
                responder.send(JSON.stringify(err));
                timeout = false;
            });
            break;
        default:
            responder.send(JSON.stringify({error: "Task name is not recognized!"}));
            timeout = false;
    }
    setTimeout(() => {
        if (timeout) {
            responder.send(JSON.stringify({error: "Request call timeout after 10 sec...."}));
        } else {
            console.log("Valid response has been send");
        }
    }, 1000*10);
});

responder.bind("tcp://*:1984", (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Server is listening on port 1984....");
    }
});

process.on("SIGINT", () => {
    responder.close();
    process.exit();
});

/**
 * convert the transactions to the schema format
 * @param {Array of transactions} trans 
 */
const convertTransaction = (trans) => {
    trans.date = new Date(trans.date);
    trans.is_recurring = false;
    // console.log(typeof trans.date);
    let array = trans.name.split(/\s+/);
    let last = array[array.length - 1];
    if (/\d+/.test(last)) {
        array = array.slice(0, array.length - 1);
        trans.general_name = array.join(' ');
    } else {
        trans.general_name = trans.name;
    }
};

const clean_transction = (transaction) => {
    let new_trans = {};
    new_trans.trans_id = transaction.trans_id;
    new_trans.user_id = transaction.user_id;
    new_trans.name = transaction.name;
    new_trans.amount = transaction.amount;
    new_trans.date = transaction.date;
    return new_trans;
};

/**
 * convert the groups output the required output format
 * @param {Array of group} groups 
 */
const clean_group = (group) => {
    let new_group = {};
    new_group.name = group.name;
    new_group.user_id = group.user_id;
    new_group.next_amount = group.next_amount;
    new_group.next_date = group.next_date;
    new_group.transactions = group.transactions.map(clean_transction);
    return new_group;
};
