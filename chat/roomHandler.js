const dbConn = require("../db/dbConn");
const { Message } = require("../db/model");
module.exports = (io) => {
    var users = [];
    const joinRoom = async (socket, data) => {
        const exist = users.find( i => i.user === data.user );
        if( !exist ) users.push({
            room_id: data.room_id,
            user: data.user,
            socket_id: socket.id
        })
        socket.join(data.room_id);
        try {
            await dbConn();
            const dbdata = await Message.findOne({ room_id: data.room_id });
            io.in(data.room_id).emit("joined_room", { msg: `${data.user} is online!`, users, doc: dbdata } );
        } catch (error) {
            console.log(error)
        }
    }
    const sendMessage = async (socket, data) => {
        try {
            await dbConn();
            const msg = await Message.findOneAndUpdate(
                { room_id: data.room_id }, 
                { $push: { messages: [{ message: data.msg, sender: data.sender, img: data.img, date: Date.now() }] } },
                { new: true, upsert: true },
            )
            if(msg) {
                io.in(msg.room_id).emit("messages", msg);
            }
        } catch (error) {
            console.log(error)
        }
    }   

    const reconnectToRoom = (res) => {
        console.log("reconnecting to room: ", res)
    }

    const disconnectRoom = (socket, reason) => {
        users = users.filter( i => i.id !== socket.id );
    }

    return {
        joinRoom,
        getMessages,
        sendMessage,
        reconnectToRoom,
        disconnectRoom
    }
}