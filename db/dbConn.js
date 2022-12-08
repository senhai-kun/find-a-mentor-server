const mongoose = require("mongoose");

const dbConn = async () => {
    console.log("Attempting to connect database...");

    const db_opt = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: true,
    };

    const conn = await mongoose
        .connect(process.env.DB_CON, db_opt)
        .then((mongoose) => {
            console.log("Connection established to database");
            return mongoose.connection.getClient();
        })
        .catch((e) => {
            console.log("failed connecting to database", e);
        });

    return conn;
};

module.exports = dbConn;
