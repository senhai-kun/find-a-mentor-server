const socketIO = require("socket.io");
const express = require("express");
const app = express.Router();

module.exports = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: process.env.ORIGIN,
            credentials: true,
            methods: ["POST", "GET"],
        },
        allowEIO3: true,
        upgrade: true,
        transports: ['websocket','polling'],
        path: "/chat"
    })
    
    const connectionHandler = require("./connectionHandler")(io);
    
    io.on("connection", connectionHandler);

    return app;
}