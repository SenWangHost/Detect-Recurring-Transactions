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
let reqObj = {task: "upsert_transactions"};
requester.send(JSON.stringify(reqObj));

process.on("SIGINT", () => {
    requester.close();
});