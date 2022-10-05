const dbConn = require("../db/dbConn");
const mongoose = require("mongoose");
const {  UsersAccount, Mentor, Schedule, MentoringList, Mentee } = require("../db/model");

const getAllMentors = async (req, res) => {
    try {
        await dbConn();

        const mentors = await Mentor.find({
            "profession": { $exists: true },
            "detailsa.about": { $exists: true }
        })

        return res.json({ mentors })

    } catch (error) {
        return res.status(500).json({ error: "Server Error", error })
    }
}

const getMentorProfile = async (req, res) => {
    const { ref_id } = req.params;

    try {
        await dbConn();

        const mentor = await Mentor.findOne({ 
            ref_id,
        }).select("-_id");

        // check if user is enrolled
        const enrolled = await MentoringList.findOne({ _id: mentor.id, "mentee._id": req.session.userID })
        
        return res.json({ mentor })

    } catch (error) {
        return res.status(500).json({ success: false, msg: "user not foundasd", error: "Server Error", error })
    }
}

const getSchedule = async (req, res) => {
    const id = req.session.userID;
    console.log("asd")
    // return res.json({ msg: "asd " });

    try {
        // await dbConn();

        const sched = await MentoringList.findOne({ "mentee._id": id }).populate("_id").populate("mentee._id").populate("mentee.schedule");
        return res.json(sched);

    } catch (error) {

        return res.status(500).json({ success: false, msg: "schedule not added", error: "Server Error", error });
    }
}

const addSchedule = async (req, res) => {
    const { from, to, email } = req.body;

    const id = req.session.userID; // should be mentor id from session

    try {
        await dbConn();

        const mentee = await Mentee.findOne({ email });
        
        const sched = await Schedule.findOneAndUpdate({ mentee: mentee._id }, { $set: { from: from, to: to, mentee: mentee._id } }, { new: true });

        if (!sched) return res.json({ msg: "Schedule not set!" });
        
        const list = await MentoringList.findOneAndUpdate({ _id: id, "mentee._id": mentee._id }, { $set: { "mentee.$.schedule": sched._id } }, {new: true})
        
        if (!list) return res.json({ msg: "Schedule not udpated to mentee!" });

        return res.json(list);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, msg: "schedule not added", error: "Server Error", error })
    }
}

const updateMentorProfile = async (req, res) => {  
    const { profession, skills, about } = req.body;

    try {
        await dbConn();

        const id = req.session.userID;
        
        console.log("ismentor: ", id);
        const ismentor = await Mentor.findOne({ _id: id });
        console.log("await mentor: ", ismentor)

        if ( !ismentor ) return res.status(404).json({ invalid: "User is not a mentor!" });

        const user = await Mentor.findOneAndUpdate({ _id: id }, { $set: { profession, details: { skills, about }} }, { new: true });

        // if ( err ) {
        //     return res.status(400).json({ error: err })
        // }

        return res.json({ success: true, user });

    } catch (error) {
        return res.status(500).json({ error: "Server error from controller" });
    }
}



module.exports = { getAllMentors, getMentorProfile, updateMentorProfile, getSchedule, addSchedule }
