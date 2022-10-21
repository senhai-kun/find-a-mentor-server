
module.exports = (io) => {

    const { joinRoom, reconnectToRoom,disconnectRoom } = require("./roomHandler")(io);

    const connectionHandler = (socket) => {
        socket.on("join_room", data => joinRoom(socket, data) );

        socket.on("reconnect", reconnectToRoom);

        socket.on("disconnect", disconnectRoom);
    }

    return connectionHandler;

}