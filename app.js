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
    console.log(reqObject);
    let timeout = true;
    switch(reqObject.task) {
        case "upsert_transactions":
            // valid the input transaction format
            if (reqObject.transactions && Array.isArray(reqObject.transactions)) {
                // convert the input transaction format into the schema format
                let transactions = reqObject.transactions;
                transactions.forEach((trans) => {convertTransaction(trans)});
                transctionService.insertTransaction(transactions).then((result) => {
                    responder.send(JSON.stringify(result));
                }, (err) => {
                    responder.send(JSON.stringify(err));
                })
            } else {
                responder.send(JSON.stringify({error: "Invalid input format for transactions!"}));
            }
            timeout = false;
            break;
        case "get_recurring_trans":
            responder.send(JSON.stringify({error: "This method is not implemented!"}));
            timeout = false;
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
 * helper method
 */
function convertTransaction(trans) {
    trans.date = new Date(trans.date);
    // console.log(typeof trans.date);
    trans.year = trans.date.getFullYear();
    trans.month = trans.date.getMonth() + 1;
    trans.day = trans.date.getUTCDate();
    trans.general_name = trans.name.replace(/[0-9]/g, "").trim();
};