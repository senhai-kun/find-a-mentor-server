const dbConn = require("../db/dbConn");
const checkUser = require("../helper/checkUser");
const { cloudinary } = require("../helper/cloudinary");
const { User, UsersAccount, Mentee, Mentor, MentoringList, Schedule } = require("../db/model");
const mongoose = require("mongoose");

const find = async (req, res) => {
    await dbConn();
    // try {
        
        // const user_data = await UsersAccount.findOne({ _id: "6336d82c6c37e462b25b0b7a" }).populate("_id");

        // const user = {
        //     ...user_data._doc._id.toObject(),
        //     ismentor: user_data.accountType === "mentor" && true,
        // }
        
        // return res.json(user);
        const sched = await MentoringList.findOne({ _id: "633d4df64f80672a430adf4d" })

        return res.json(sched)

        // const user = await MentoringList.findOne({ _id: "6336d3bfe8cc63d0b7d3c6aa"}).populate("mentee._id").populate("mentee.schedule");

        // return res.json(user)

        // const user = await MentoringList.findOneAndUpdate({ _id: "6336d3bfe8cc63d0b7d3c6aa", "mentee._id": "6336d82c6c37e462b25b0b7a" }, { $set: { "mentee.$.schedule": "633a38c9c83e9a198d26273e" } }, {new: true})
        // return res.json(user)

        // .populate("_id")
        // .populate("mentee._id")
        
        // .exec( async (err, doc) => {
        //     await console.log("Populated User: " + doc);
        // } )
        // .then( doc => {
        //     return res.json(doc)
        // } )
        // .catch( e => {
        //     return res.json(e)
        // })

        // let user = {
        //     ...user
        // }

       

        // const agg = await UsersAccount.aggregate([
        //     {
        //         $lookup: {
        //             from: "mentors",
        //             localField: "email",
        //             foreignField: "email",
        //             as: "mentor",
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "mentees",
        //             localField: "email",
        //             foreignField: "email",
        //             as: "mentee",
        //         }
        //     },
        //     { 
        //         $match: { _id: mongoose.Types.ObjectId("632a7f239a848312a615888a"), ref_id: "6ydkqIp5d" }
        //     },
        //     { 
        //         $project: { 
        //             ismentor: { $cond: { if: {$eq: ["$mentor", []]}, then: false, else: true  } },
        //             user: { $concatArrays: ["$mentor", "$mentee"] }, 
        //             "ref_id": 1,
        //             "email": 1
        //         } 
        //     },
        // ])

        // const agg = await MentoringList.aggregate([
        //     {
        //         $lookup: {
        //             from: "mentor",
        //             localField: "mentee_list",
        //             foreignField: "mentee_list",
        //             as: "mentor",
        //         }
        //     },
        //     // {
        //     //     $lookup: {
        //     //         from: "mentee",
        //     //         localField: "mentor_list",
        //     //         foreignField: "mentee",
        //     //         as: "mentee",
        //     //     }
        //     // },
        //     // {
        //     //     $unwind: "$mentor"
        //     // },
        //     {
        //         $lookup: {
        //             from: "mentoring_list",
        //             localField: "mentee_list",
        //             foreignField: "mentee_list",
        //             as: "list"
        //         }
        //     },
        //     // {
        //     //     $match: {
        //     //         "mentor.mentee_list": "mentoring_lists._id"
        //     //     }
        //     // }
        //     // { 
        //     //     $project: { 
        //     //         ismentor: { $cond: { if: {$eq: ["$mentor", []]}, then: false, else: true  } },
        //     //         user: { $concatArrays: ["$mentor", "$mentee"] }, 
        //     //         "ref_id": 1,
        //     //         "email": 1
        //     //     } 
        //     // },
        // ])

        // return res.json(agg)

        // await Mentee.find().populate({path: "mentor_list", model: "mentoring_list"}).exec( (err, user) => {
        //     if (err) return res.json(err)
        //     return res.json(user);
        // } )

        // await Mentor.findOne({ _id: "632f9bb5118ef7614a66db72" })
        // .populate({path: "mentee_list", model: "mentoring_list" })
        // .exec( (err, user) => {
        //     if (err) console.log(err);
        //     return res.json(user);
        // } )

        // await MentoringList.find().populate({ path: "_id", model: "mentor" }).exec( (err, user) => {
        //     if (err) return res.json(err);
        //     return res.json(user);
        // } )
        // const agg = await Mentee.find().populate("")

        // return res.json({ agg });
        
    // } catch (e) {
    //     return res.json({e})
    // }
}

const sessionController = async (req, res) => {
    try {
        await dbConn();

        const id = req.session.userID;

        console.log("session Controller: ",req.session.userID)

        // checks if a legitimate user
        // const exist = await UsersAccount.findOne({ _id: id });

        // if (!exist) return res.status(403).send({ error: "User not exist" });

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
    console.log(location, firstname, lastname, location, ref_id);

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
                }, { new: true, upsert: true });

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
            }, { new: true, upsert: true });

            return res.json({ success: true, user});
        } else {
            if( img === "no_image" ) {
                const user = await Mentee.findOneAndUpdate({ ref_id: ref_id }, { 
                    $set: {
                        firstname,
                        lastname,
                        coordinates: location,
                    }
                }, { new: true, upsert: true });

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
            }, { new: true, upsert: true });

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

            const mentor = await MentoringList.findOne({ _id: user._id }).populate("_id").populate("mentee._id");

            return res.json({ ismentor, mentor });
        } else {
            const user = await Mentee.findOne({ ref_id });

            const mentee = await MentoringList.findOne({ "mentee._id": user._id }).populate("_id").populate("mentee._id");

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
    getUserProfile
};
