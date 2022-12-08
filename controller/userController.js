const dbConn = require("../db/dbConn");
const { cloudinary } = require("../helper/cloudinary");
const { UsersAccount, Mentee, Mentor, MentoringList } = require("../db/model");
const { sendMail, sendMentorEmail } = require("../sendmail/sendMail");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const find = async (req, res) => {
    const mentor = await MentoringList.findOne({ _id: "633d4df64f80672a430adf4d" })
    .populate({path: "_id",  match: { "mentee.status.accepted": true } })
    .populate({path: "mentee._id"})
    .populate({path: "mentee.schedule._id"});

    return res.json({mentor: [mentor]});
}

const sendEmail = async (req, res) => {
    const { from, to, mentor, text } = req.body;
    let result = await sendMentorEmail({ subject: `Mentor: ${mentor}`, from: `Find A Mentor <${from}>`, cc: to, to: to, text: text });

    return res.json(result);

}

const sessionController = async (req, res) => {
    try {
        await dbConn();
        const id = req.session.userID;

        console.log("session Controller: ",req.session.userID)

        const user_data = await UsersAccount.findOne({ _id: id }).populate({ path: "_id", select: "-_id"});

        if (!user_data) return res.status(403).send({ error: "User not exist" });
        
        const user = {
            ...user_data._doc._id.toObject(),
            ismentor: user_data.accountType === "mentor" && true,
        }

        // user authorized successfully
        return res.json({
            success: true,
            isLoggedIn: true,
            user
        });
    } catch (e) {
        return res.status(500).json({ error: "Server error from controller" });
    }
};

const profileImgController = async (req, res) => {
    const { img, ismentor } = req.body;
    const id = req.session.userID;
    console.log("Uploading ....");
    try {
        await dbConn();
        const upload = await cloudinary.uploader.upload(img, {
            upload_preset: "mentor",
            folder: `mentor/${id}`,
        });

        if ( ismentor ) {
            const mentor = await Mentor.findByIdAndUpdate(
                { _id: id },
                {
                    $set: {
                        img: `https://res.cloudinary.com/find-a-mentor/v1/${upload.public_id}`,
                    },
                },
                { upsert: true, new: true }
            );

            const user = {
                ...mentor._doc,
                ismentor: true
            }

            return res.json({ success: true, user });
        } else {
            const mentee = await Mentee.findByIdAndUpdate(
                { _id: id },
                {
                    $set: {
                        img: `https://res.cloudinary.com/find-a-mentor/v1/${upload.public_id}`,
                    },
                },
                { upsert: true, new: true }
            );

            const user = {
                ...mentee._doc,
                ismentor: false
            }
    
            return res.json({ success: true, user });
        }

        return res.json({ success: true, user });
    } catch (e) {
        return res.json({ success: false, error: e });
    }
};

const updateUserProfile = async (req, res) => {
    const { ismentor, img, firstname, lastname, location, ref_id, phone, birthday } = req.body;
    const id = req.session.userID;
    console.log( firstname, lastname, location, ref_id);
    try {
        await dbConn();

        if( ismentor ) { 
            if( img === "no_image" ) {
                const user = await Mentor.findOneAndUpdate({ ref_id: ref_id }, { 
                    $set: {
                        firstname,
                        lastname,
                        phone,
                        birthday,
                        coordinates: location,
                    }
                }, { new: true });

                return res.json({ success: true, user});
            }

            const upload = await cloudinary.uploader.upload(img, {
                upload_preset: "mentor",
                folder: `mentor/${id}`,
            });

            const user = await Mentor.findOneAndUpdate({ ref_id: ref_id }, { 
                $set: {
                    firstname,
                    lastname,
                    phone,
                    birthday,
                    coordinates: location,
                    img: `https://res.cloudinary.com/find-a-mentor/v1/${upload.public_id}`,
                }
            }, { new: true });

            return res.json({ success: true, user});
        } else {
            if( img === "no_image" ) {
                const user = await Mentee.findOneAndUpdate({ ref_id: ref_id }, { 
                    $set: {
                        firstname,
                        lastname,
                        phone,
                        birthday,
                        coordinates: location,
                    }
                }, { new: true});

                return res.json({ success: true, user});
            }

            const upload = await cloudinary.uploader.upload(img, {
                upload_preset: "mentor",
                folder: `mentor/${id}`,
            });

            const user = await Mentee.findOneAndUpdate({ ref_id: ref_id }, { 
                $set: {
                    firstname,
                    lastname,
                    phone,
                    birthday,
                    coordinates: location,
                    img: `https://res.cloudinary.com/find-a-mentor/v1/${upload.public_id}`,
                }
            }, { new: true });

            return res.json({ success: true, user});
        }

    } catch (error) {
        console.log(error)
        return res.json({ success: false, error: error });
    }
}

const getUserProfile = async (req, res) => {
    const { ref_id } = req.params
    const { ismentor } = req.body;
    const id = req.session.userID;
    try {
        await dbConn();

        if (ismentor) {
            const user = await Mentor.findOne({ ref_id });

            const mentor = await MentoringList
            .findOne({ _id: user._id })
            .populate("_id")
            .populate("mentee._id")
            .populate("mentee.schedule._id");
            
            
            return res.json({ ismentor, mentor });
        } else {
            const user = await Mentee.findOne({ ref_id });

            const mentee = await MentoringList.find({ "mentee._id": id }).populate("_id").populate("mentee._id").populate("mentee.schedule._id");
            // console.log("mentee", mentee)

            return res.json({ ismentor, mentee });
        }

    } catch (error) {
        console.log(error)
        return res.json({ success: false, error: error });
    }
}

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const id = req.session.userID;
    try {
        await dbConn();
        const user = await UsersAccount.findOne({ _id: id }).select("+password");

        // check user
        if(!user) return res.status(400).json({ error: "User not found!" });

        // verify current password
        const verifyCurrentPassword = await bcrypt.compare(currentPassword, user.password);

        if(!verifyCurrentPassword) return res.json({ success: false, params: "currentPassword", errorMsg: "Current Password Incorrect!" });
        
        // hash new password and save
        const newPasswordHashed = await bcrypt.hash(newPassword, parseInt(process.env.HASH));

        const updatedUser = await UsersAccount.findOneAndUpdate({ _id: id }, { $set: { password: newPasswordHashed } }, { new: true });

        return res.json({ success: true, msg: "Password Changed!" });
        
    } catch (error) {
        return res.status(500).json({ success: false, error: error, msg: "Internal Server Error!" })
    }
}

const resetPasswordUrl = async (req, res) => {
    const { email } = req.body
    try {
        await dbConn();

        const user = await UsersAccount.findOne({ email });

        const token = await jwt.sign({ id: user._id }, `${process.env.JWT_SECRET}`, { expiresIn: '1h' } )

        // generate url for reset password
        const url = `${process.env.ORIGIN}/account/reset?token=${token}`;

        // send url to email
        const result = await sendMail({ subject: `Account password reset!`, to: email, text: url });
        
        return res.json({ success: true, msg: "Email has been sent! Please check your inbox." })

    } catch (error) {
        console.log("resetPasswordurl: ", error);
        return res.status(500).json({ success: false, error: error, msg: "Internal Server Error!" })
    }
}

const verifyUrlReset = async (req, res) => {
    const { token } = req.body;
    try {
        // verify token
        await jwt.verify(token, `${process.env.JWT_SECRET}`, async (err, decode) => {
            // redirection error
            if(err) {
                if (err?.message === "jwt expired") return res.json({ success: false, msg: "Token has expired!" });
                if (err?.message === "jwt malformed") return res.json({ success: false, msg: "Invalid token!" });
            }

            // token verified generate new token to reset expiry
            const resetToken = await jwt.sign({ id: decode.id }, `${process.env.JWT_SECRET}`, { expiresIn: '1d' });

            return res.json({ success: true, msg: "Token verified!", resetToken });
        });
        

    } catch (error) {
        console.log("verifyUrl: ", error);
        return res.status(500).json({ success: false, error: error, msg: "Internal Server Error!" })
    }
}

const resetPassword = async (req, res) => {
    const { newPassword, resetToken } = req.body;
    try {
        await dbConn();

        await jwt.verify(resetToken,`${process.env.JWT_SECRET}`, async (err, decode) => {
            // redirection error
            if(err) {
                if (err?.message === "jwt expired") return res.json({ success: false, msg: "Token has expired!" });
                if (err?.message === "jwt malformed") return res.json({ success: false, msg: "Invalid token!" });
            }

            const newPasswordHashed = await bcrypt.hash(newPassword, parseInt(process.env.HASH));

            const updatedUser = await UsersAccount.findOneAndUpdate({ _id: decode.id }, { $set: { password: newPasswordHashed } }, { new: true });
            
            return res.json({ success: true, msg: "Password has been reset!" });
        });

        

    } catch (error) {
        console.log("reset password: ", error);
        return res.status(500).json({ success: false, error: error, msg: "Internal Server Error!" });
    }
}

const searchLocation = async (req, res) => {
    const { addressQuery } = req.query;
    try {
        const baseUrl = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&"
        const address = `singleLine=${addressQuery}&`
        const token = `token=${process.env.GEO_TOKEN}`

        const locAddress = await axios.get(baseUrl + address + token);

        let locations = locAddress.data.candidates.map( (i, index) => 
            { return { 
                index,
                address: i.address, 
                coordinates: {
                    lng: i.location.x,
                    lat: i.location.y
                }
            }}
        )

        return res.json({ success: true, locations })
        
    } catch (error) {
        console.log("Location: ", error);
        return res.status(500).json({ success: false, error: error, msg: "Internal Server Error!" });
    }
}

module.exports = {
    sessionController,
    profileImgController,
    find,
    updateUserProfile,
    getUserProfile,
    sendEmail,
    changePassword,
    resetPasswordUrl,
    verifyUrlReset,
    resetPassword,
    searchLocation
};
