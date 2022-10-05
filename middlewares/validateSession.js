const bcrypt = require("bcrypt");
const checkUser = require("../helper/checkUser");

const getToken = (header) => {
    if (typeof header !== "undefined") {
        const bearer = header.split(" ");
        const token = bearer[1];

        return token;
    }

    return false; // return false when token is missing
};

module.exports = async (req, res, next) => {
    const id = req.session?.userID;
    console.log("validating session");

    if ( !id ) {
        // session invalid
        req.session.destroy();
        res.clearCookie(process.env.SESSION_NAME);
        return res.status(401).send({ error: "Unauthorized request" });
    }

    const token = getToken(req.headers["authorization"]);

    if (!token) return res.status(400).json({ error: "Missing Token" });

    const valid = await bcrypt.compare(id, token);

    if (!valid) return res.status(400).json({ error: "Invalid token" });

    const user = await checkUser(id);

    if (!user) return res.status(400).json({ error: "User not found" })

    // user validated successfull
    next();
};
