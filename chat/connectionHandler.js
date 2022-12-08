module.exports = (io) => {
    const { joinRoom, getMessages, sendMessage, reconnectToRoom,disconnectRoom } = require("./roomHandler")(io);

    const connectionHandler = (socket) => {
        socket.on("join_room", data => joinRoom(socket, data) );

        socket.on("get_messages", data => getMessages(data) );

        socket.on("send_message", async (data) => await sendMessage(socket, data) );

        socket.on("reconnect", reconnectToRoom);

        socket.on("disconnect", reason => disconnectRoom(socket, reason));
    }
    return connectionHandler;
}