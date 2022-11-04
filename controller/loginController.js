const dbConn = require("../db/dbConn");
const { UsersAccount, Mentee, Mentor } = require("../db/model");
const bcrypt = require("bcrypt");
const checkUser = require("../helper/checkUser");
const shortid = require("shortid");

const loginController = async (req, res) => {
    await dbConn(); // initialize db connection

    try {
        const { email, password } = req.body;

        console.log("find user");
        const user = await UsersAccount.findOne({ email }).select("+password +_id");

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
    const { firstname, lastname, email, phone, birthday, password, ismentor } = req.body;

    await dbConn(); // initialize db connection

    try {
        console.log("Adding user...");
        // setup shortid 
        shortid.characters(process.env.SHORTID);
        const ref_id = shortid.generate();

        // check if email exists
        // const exist = await checkUser({ email });
        const exist = await UsersAccount.findOne({ email });
        if (exist) return res.status(422).json({ email: "Account already exists!" });

        const encryptPass = await bcrypt.hash(
            password,
            parseInt(process.env.HASH)
        );

        if ( ismentor ) {
            await new Mentor({
                firstname,
                lastname,
                email,
                phone,
                birthday,
                ref_id
            }).save( async (err, result) => {
                if (!err) {
                    await UsersAccount({
                        _id: result._id,
                        email,
                        password: encryptPass,
                        accountType: "mentor"
                    }).save();

                    const famID = await bcrypt.hash(
                        String(result._id),
                        parseInt(process.env.HASH)
                    );
            
                    console.log("User successfully added...");
            
                    req.session.userID = result._id;
                    
                    return res.json({ success: true, famID, ismentor });
                }
            })
        } else {
            await new Mentee({
                firstname,
                lastname,
                email,
                phone,
                birthday,
                ref_id
            }).save( async (err, result) => {
                if (!err) {
                    await UsersAccount({
                        _id: result._id,
                        email,
                        password: encryptPass,
                        accountType: "mentee"
                    }).save();

                    const famID = await bcrypt.hash(
                        String(result._id),
                        parseInt(process.env.HASH)
                    );
            
                    console.log("User successfully added...");
            
                    req.session.userID = result._id;
                    
                    return res.json({ success: true, famID, ismentor });
                }
            })
        }
        
    } catch (e) {
        return res.status(422).json({ success: false, e });
    }
};

const logoutController = (req, res) => {
    res.clearCookie("fam-ses", { path: '/' });
    console.log("logging out");
    // req.session.destroy();
    return res.json({ logout: "true" });
};

module.exports = {
    loginController,
    registerController,
    logoutController,
};
