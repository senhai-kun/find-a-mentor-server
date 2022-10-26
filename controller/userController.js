const dbConn = require("../db/dbConn");
const checkUser = require("../helper/checkUser");
const { cloudinary } = require("../helper/cloudinary");
const { UsersAccount, Mentee, Mentor, MentoringList, Schedule } = require("../db/model");
const mongoose = require("mongoose");
const sendMail = require("../sendmail/sendMail");

const find = async (req, res) => {
    
    // let result = await sendMail({ subject: "Mentor: Senpai Kouhai", from: "Find A Mentor <asdsenpaikouhai04@gmail.com>", cc: "senpaikouhai04@gmail.com", to: "agustinagapito09@gmail.com" })

    // return res.json({ result })

    // const users = await UsersAccount.find().select("+password");
    // const mentor = await Mentor.find();
    // const mentee = await Mentee.find();
    // const mentoringList = await MentoringList.find();
    const schedule = await MentoringList.findOne({ "mentee.schedule._id": "6357dca3615c61a089d39e29" });

    return res.json(schedule);

    // return res.json({ users, mentor, mentee, mentoringList, schedule })

    // try {
        // await dbConn();

        // const text = "thre";

        // const mentor = await Mentor.find({ $or: [{ "firstname": { $regex: text } }, { "lastname": { $regex: text } }, { "profession": { $regex: text } }] })

        // return res.json({mentor})
        
    // } catch (error) {
    //     return res.json({ error })
    // }

}

const sendEmail = async (req, res) => {
    const { from, to, mentor, text } = req.body;
    let result = await sendMail({ subject: `Mentor: ${mentor}`, from: `Find A Mentor <${from}>`, cc: to, to: to, text: text });

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

        // const user = await User.findByIdAndUpdate(
        //     { _id: id },
        //     {
        //         $set: {
        //             img: `https://res.cloudinary.com/find-a-mentor/v1/${upload.public_id}`,
        //         },
        //     },
        //     { upsert: true, new: true }
        // );

        return res.json({ success: true, user });
    } catch (e) {
        return res.json({ success: false, error: e });
    }
};

const updateUserProfile = async (req, res) => {
    const { ismentor, img, firstname, lastname, location, ref_id } = req.body;
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

            const mentee = await MentoringList.find({ "mentee._id": user._id }).populate("_id").populate("mentee._id").populate("mentee.schedule._id");
            // console.log("mentee", mentee)

            return res.json({ ismentor, mentee });
        }

    } catch (error) {
        console.log(error)
        return res.json({ success: false, error: error });
    }
}

module.exports = {
    sessionController,
    profileImgController,
    find,
    updateUserProfile,
    getUserProfile,
    sendEmail
};
