const zmq = require('zeromq');
// socket to talk to clients
const responder = zmq.socket('rep');

responder.on('message', (request) => {
    console.log("Received request: [" + request.toString() + "]");
    // use only for test
    setTimeout(() => {
        responder.send("World");
    }, 1000);
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
});