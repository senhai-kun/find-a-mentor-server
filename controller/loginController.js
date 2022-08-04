const dbConn = require("../db/dbConn");
const User = require("../db/model");
const bcrypt = require("bcrypt");
const checkUser = require("../helper/checkUser");

const loginController = async (req, res) => {
    await dbConn(); // initialize db connection

    try {
        const { email, password } = req.body;

        console.log("find user");
        const user = await User.findOne({ email }).select("+password +_id");

        if (!user)
            return res.status(422).json({
                success: false,
                param: "email",
                errorMsg: "Account doesn't exists.",
            });
        console.log("user found");

        const validate = await bcrypt.compare(password, user.password);

        if (!validate)
            return res.status(422).json({
                success: false,
                param: "password",
                errorMsg: "Incorrect Password",
            });

        console.log("user validated");
        // create new token
        const famID = await bcrypt.hash(
            user._id.toString(),
            parseInt(process.env.HASH)
        );

        req.session.userID = user._id;

        return res.json({ success: true, famID });
    } catch (e) {
        return res
            .status(500)
            .json({ success: false, msg: "Server error", error: e });
    }
};

const registerController = async (req, res) => {
    const { firstname, lastname, email, password, ismentor } = req.body;

    await dbConn(); // initialize db connection

    try {
        console.log("Adding user...");

        // check if email exists
        const exist = await checkUser({ email });
        if (exist)
            return res.status(422).json({ error: "Account already exists" });

        const encryptPass = await bcrypt.hash(
            password,
            parseInt(process.env.HASH)
        );

        const user = await new User({
            firstname,
            lastname,
            email,
            password: encryptPass,
            ismentor,
        }).save();

        const famID = await bcrypt.hash(
            String(user._id),
            parseInt(process.env.HASH)
        );

        console.log("User successfully added...");

        req.session.userID = user._id;

        return res.json({ success: true, famID });
    } catch (e) {
        return res.status(422).json({ success: false, e });
    }
};

const logoutController = (req, res) => {
    res.clearCookie("fam-ses", { path: '/' });
    console.log("logging out");
    req.session.destroy();
    return res.json({ logout: "true" });
};

module.exports = {
    loginController,
    registerController,
    logoutController,
};
