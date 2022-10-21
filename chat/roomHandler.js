
let users = {};

module.exports = (io) => {

    const joinRoom = (socket, data) => {

        console.log("joining room", data);
        console.log("socket id: ", socket.id);
        users[socket.id] = data.user;

        socket.join(data.room);

        io.to(data.room).emit("joined_room", { msg: `${data.user} is online!`, users})
    }

    const reconnectToRoom = (res) => {
        console.log("reconnecting to room: ", res)
    }
    
    const disconnectRoom = (reason) => {
        console.log("disconnect: ", reason)
    }

    return {
        joinRoom,
        reconnectToRoom,
        disconnectRoom
    }
}