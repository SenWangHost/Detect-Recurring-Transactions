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
            transctionService.insertTransaction({}).then((result) => {
                timeout = false;
            }, (err) => {

            })
            break;
        case "get_recurring_trans":
            responder.send(JSON.stringify({message: "This method is not implemented!"}));
            timeout = false;
            break;
        default:
            responder.send(JSON.stringify({message: "Task name is not recognized!"}));
            timeout = false;
    }
    setTimeout(() => {
        if (timeout) {
            responder.send(JSON.stringify({message: "Request call timeout after 10 sec...."}));
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