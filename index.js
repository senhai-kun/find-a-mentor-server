const express = require("express");
const app = express();
const env = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const dbConn = require("./db/dbConn");
env.config();
const port = process.env.PORT

// security
app.disable("x-powered-by");
app.use(
    cors({
        origin: process.env.ORIGIN,
        credentials: true,
        methods: ["POST", "GET"],
    })
);
app.use(helmet());
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// session
const sess = {
    httpOnly: false,
    maxAge: 7 * 24 * 3600 * 1000, // 1week session
    secure: false,
    sameSite: 'Lax'
};

if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sess.secure = true; // serve secure cookies
    sess.httpOnly = true;
    // sess.sameSite = "strict";
    sess.maxAge = 7 * 24 * 3600 * 1000; // 1week session
}

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        name: process.env.SESSION_NAME,
        saveUninitialized: true,
        resave: false,
        store: MongoStore.create({
            // clientPromise: dbConn(),
            mongoUrl: process.env.DB_CON,
            dbName: process.env.DB_NAME,
            crypto: {
                secret: process.env.SESSION_CRYPTO_SECRET,
            },
            autoRemove: "interval",
            autoRemoveInterval: 10,
            ttl: 5 * 24 * 60 * 60,
        }),
        cookie: sess,
    })
);

// api
app.use(userRoutes);

// server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
