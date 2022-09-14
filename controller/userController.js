const dbConn = require("../db/dbConn");
const checkUser = require("../helper/checkUser");
const { cloudinary } = require("../helper/cloudinary");
const User = require("../db/model");

const sessionController = async (req, res) => {
    try {
        await dbConn();

        const id = req.session.userID;

        console.log("session Controller: ",req.session.userID)

        // checks if a legitimate user
        const user = await checkUser({ _id: id });

        if (!user) return res.status(403).send({ error: "User not exist" });

        // user authorized successfully
        return res.json({
            success: true,
            isLoggedIn: true,
            user,
        });
    } catch (e) {
        return res.status(500).json({ error: "Server error" });
    }
};

const profileImgController = async (req, res) => {
    const img = req.body.img;
    const id = req.session.userID;

    console.log("Uploading ....");

    try {
        await dbConn();

        const upload = await cloudinary.uploader.upload(img, {
            upload_preset: "mentor",
            folder: `mentor/${id}`,
        });

        const user = await User.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    img: `https://res.cloudinary.com/find-a-mentor/v1/${upload.public_id}`,
                },
            },
            { upsert: true, new: true }
        );

        return res.json({ success: true, user });
    } catch (e) {
        return res.json({ success: false, error: e });
    }
};

module.exports = {
    sessionController,
    profileImgController,
};
