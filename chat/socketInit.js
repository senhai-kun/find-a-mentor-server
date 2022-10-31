const socketIO = require("socket.io");
const express = require("express");
const http = require("http");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5001;
const server = http.createServer(app);

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

server.listen( port, () => {
    console.log(`Running socket in port: ${port}`);
} )
