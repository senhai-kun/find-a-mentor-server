const { UsersAccount } = require('../db/model');
const mongoose = require("mongoose");

module.exports = async (id) => {
    console.log(" Checking user... ");

    const agg = await UsersAccount.aggregate([
        {
            $lookup: {
                from: "mentors",
                localField: "_id",
                foreignField: "_id",
                as: "mentor",
            }
        },
        {
            $lookup: {
                from: "mentees",
                localField: "_id",
                foreignField: "_id",
                as: "mentee",
            }
        },
        { 
            $match: { _id: mongoose.Types.ObjectId(id) }
        },
        { $project: { user: { $concatArrays: ["$mentor", "$mentee"] } } },
    ])

    const user = agg[0].user[0]

    return user;
}