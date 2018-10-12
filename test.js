/**
 * the client side of zeromq is used to conduct test
 */
const zmq = require("zeromq");

// socket to talk to server
console.log("Starting the test client…");
const requester = zmq.socket('req');

requester.on("message", (reply) => {
    console.log("Received reply: [" + reply.toString() + "]");
    console.log(JSON.parse(reply.toString()));
});

requester.connect("tcp://localhost:1984");

// for basic test
let transaction1 = {
    trans_id: '1',
    user_id: '1',
    name: 'Comcast',
    amount: 66.41,
    date: new Date('2018-08-08T07:00:00.000Z')
};
  
let transaction2 = {
    trans_id: '6',
    user_id: '1',
    name: 'Comcast',
    amount: 66.41,
    date: new Date('2018-07-09T07:00:00.000Z')
};
  
let transaction3 = {
    trans_id: '11',
    user_id: '1',
    name: 'Comcast',
    amount: 66.41,
    date: new Date('2018-06-08T07:00:00.000Z')
};

let transaction4 = {
    trans_id: '19',
    user_id: '1',
    name: 'Comcast',
    amount: 63.25,
    date: new Date('2018-05-08T07:00:00.000Z')
};

let reqObj = {task: "upsert_transactions", transactions: [transaction1, transaction2, transaction3, transaction4]};
let reqObj2 = {task: "get_recurring_trans"};
requester.send(JSON.stringify(reqObj2));

process.on("SIGINT", () => {
    requester.close();
});