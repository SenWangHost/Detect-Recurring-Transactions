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
    trans_id: '42',
    user_id: '1',
    name: 'YMCA',
    amount: 69,
    date: new Date('2018-08-10T08:00:00.000Z')
};
  
let transaction2 = {
    trans_id: '1',
    user_id: '1',
    name: 'Comcast',
    amount: 66.41,
    date: new Date('2018-08-08T07:00:00.000Z')
};
  
let transaction3 = {
    trans_id: '30',
    user_id: '1',
    name: 'PAYROLL 180307',
    amount: -930.82,
    date: new Date('2018-08-07T08:00:00.000Z')
};

let reqObj = {task: "upsert_transactions", transactions: [transaction1, transaction2, transaction3]};
requester.send(JSON.stringify(reqObj));

process.on("SIGINT", () => {
    requester.close();
});