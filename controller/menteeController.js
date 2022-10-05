const dbConn = require("../db/dbConn");
const mongoose = require("mongoose");
const { UsersAccount, Mentor, MentoringList, Mentee, Schedule } = require("../db/model");

const getMentor = async (req, res) => {
    const mentee_id = "6337e9f71c2c4667d641c5b9"
    try {
        await dbConn();

        const mentor = await MentoringList.find({ "mentee._id": mentee_id });

        return res.json(mentor)

    } catch (error) {
        return res.status(500).json({ success: false, msg: "Mentor not found", error: "Server Error", error })
    }
}

const enrollMentee = async (req, res) => {
    const { ref_id } = req.body;
    const mentee_id = req.session.userID;

    try {
        await dbConn();

        const mentor = await Mentor.findOne({ ref_id }).select("+_id");

        // const existsOnList = await MentoringList.findOne({ _id: mentor._id });

        // if ( existsOnList ) {
            const list = await MentoringList.findOneAndUpdate({ _id: mentor._id }, { $push: { mentee: [{ _id: mentee_id }] } }, { new: true, upsert: true });

        //     return res.json({ list });
        // } else {
            // console.log("not exists", mentee_id);
            // const list = await new MentoringList({
            //     _id: mentor._id,
            //     // mentee_list: mentor.mentee_list,
            //     mentee: [
            //         {
            //             _id: mentee_id
            //         }
            //     ]
            // }).save();

            return res.json({ success: true });
        // }

    } catch (error) {
        return res.status(500).json({ success: false, msg: "User not added to mentoring list!", error: "Server Error", error })
    }
}

const checkIfEnrolled = async (req, res) => {
    const { mentor_ref_id, mentee_ref_id } = req.params;

    try {
        await dbConn();

        const mentor = await Mentor.findOne({ ref_id: mentor_ref_id });

        if (!mentor) return res.status(404).json({ msg: "Mentor not found!" });

        const mentee = await Mentee.findOne({ ref_id: mentee_ref_id });
        
        if (!mentee) return res.status(404).json({ msg: "Mentee not found!" });

        const enrolled = await MentoringList.findOne({ _id: mentor._id, "mentee._id": mentee._id });

        // user is not in enrolled list!
        if (!enrolled ) return res.json({ success: true, enrolled: false, msg: "User not enrolled" });

        return res.json({ success: true, enrolled: true });

    } catch (error) {
        return res.status(500).json({ success: false, msg: "User not Enrolled", error: "Server Error", error })
    }
}

const approveSchedule = async (req, res) => {
    
    const { sched_id } = req.body;

    try {

        await dbConn();

        const sched = await Schedule.findOneAndUpdate({ _id: sched_id }, { $set: { approved: true } }, { new: true });

        return res.json(sched);
        
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Schedule not Approved", error: "Server Error", error })
    }
}


module.exports = { 
    enrollMentee,
    getMentor,
    checkIfEnrolled,
    approveSchedule
}