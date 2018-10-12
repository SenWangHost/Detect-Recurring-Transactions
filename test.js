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

let transaction5 = {
    trans_id: '21',
    user_id: '1',
    name: "Dick's Fresh Market",
    amount: 29.32,
    date: new Date('2018-05-03T07:00:00.000Z')
};

let transaction6 = {
    trans_id: '2',
    user_id: '1',
    name: "Quicken Loans 080618",
    amount: 1096.17,
    date: new Date('2018-08-06T07:00:00.000Z')
};

let transaction7 = {
    trans_id: '7',
    user_id: '1',
    name: "Quicken Loans 070518",
    amount: 1096.17,
    date: new Date('2018-07-05T07:00:00.000Z')
};

let transaction8 = {
    trans_id: '12',
    user_id: '1',
    name: "Quicken Loans 060518",
    amount: 1096.17,
    date: new Date('2018-06-05T07:00:00.000Z')
};

let transaction9 = {
    trans_id: '20',
    user_id: '1',
    name: "Quicken Loans 050718",
    amount: 1096.17,
    date: new Date('2018-05-07T07:00:00.000Z')
};

let array = [
    transaction1, 
    transaction2, 
    transaction3, 
    transaction4, 
    transaction5,
    transaction6,
    transaction7,
    transaction8,
    transaction9
];

let reqObj1 = {task: "upsert_transactions", transactions: array};
let reqObj2 = {task: "get_recurring_trans"};
requester.send(JSON.stringify(reqObj1));

process.on("SIGINT", () => {
    requester.close();
});