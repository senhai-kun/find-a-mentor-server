const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const env = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const dbConn = require("./db/dbConn");

var allowlist = ["http://localhost:3000", "https://find-mentor.vercel.app"];

var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowlist.indexOf(req.header("Origin")) !== -1) {
        corsOptions = { origin: true, credentials: true }; // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
};

// security
app.disable("x-powered-by");
env.config();
app.use(cors(corsOptionsDelegate));
app.use(helmet());
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// session
const sess = {
    httpOnly: false,
    maxAge: 7 * 24 * 3600 * 1000, // 1week session
    secure: false,
};

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        name: process.env.SESSION_NAME,
        saveUninitialized: false,
        resave: false,
        store: MongoStore.create({
            clientPromise: dbConn(),
            dbName: process.env.DB_NAME,
            crypto: {
                secret: process.env.SESSION_CRYPTO_SECRET,
            },
            autoRemove: "interval",
            autoRemoveInterval: 10,
            ttl: 5 * 24 * 60 * 60,
        }),
        cookie: sess,
        // rolling: true,
    })
);

if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sess.secure = true; // serve secure cookies
    sess.httpOnly = true;
}

// api
app.use(userRoutes);

// server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
