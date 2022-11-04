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
    const { ref_id, message } = req.body;
    const mentee_id = req.session.userID;

    try {
        await dbConn();

        const mentor = await Mentor.findOne({ ref_id }).select("+_id");

        if (!mentor) return res.status(400).json({ error: "Mentor not found!" });

        // const existsOnList = await MentoringList.findOne({ _id: mentor._id });

        // if ( existsOnList ) {
            const list = await MentoringList.findOneAndUpdate({ _id: mentor._id }, { $push: { mentee: [{ _id: mentee_id,  "status.message": message }] }, }, { new: true });
            // const status = await MentoringList.findOneAndUpdate({ _id: mentor._id, "mentee._id": mentee_id }, { $addToSet: { mentee: [{ "status.message": message }] } }, { new: true });
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

        const sched = await Schedule.findOneAndUpdate({ _id: sched_id }, { $set: { approved: true } }, { new: true, upsert: true });

        return res.json(sched);
        
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Schedule not Approved", error: "Server Error", error })
    }
}

const rateMentor = async (req, res) => {
    const { sched_id, rate, mentor_id } = req.body

    try {
        await dbConn();
        
        const sched = await Schedule.findOneAndUpdate({ _id: sched_id }, { $set: { rating: { rated: true, rate: rate } } }, { new: true });

        const mentor = await Mentor.findOne({ _id: mentor_id });

        if( !mentor ) return res.status(400).json({ error: "Mentor not found!" });

        if( !mentor.details.rating.rated ) {
            // first ratings
            const rated = await Mentor.findOneAndUpdate({ _id: mentor_id }, { $set: { "details.rating.rate": sched.rating.rate, "details.rating.rated": true, "details.rating.total_count": 1 } }, { new: true });
            if(!rated) return res.json({ success: false, error: rated, msg: "Error on first rating query." });

            return res.json({ success: true, msg: "Rate submitted!" })
        } else {
            // increment ratings
            const totalsum = Number(mentor.details.rating.rate) + Number(rate);
            const avg = totalsum / 2;

            const rated = await Mentor.findOneAndUpdate({ _id: mentor_id }, { $set: { "details.rating.rate": avg }, $inc: { "details.rating.total_count": 1 } }, { new: true });
            if(!rated) return res.json({ success: false, error: rated, msg: "Error on first rating query." });

            return res.json({ success: true, msg: "Rate submitted!" })
        }

        // mentor table ** dapat percentage na ng rating ang andito
        //  $set: { details: { rating: { rate: sched.rating.rate } } }
        // const rated = await Mentor.findOneAndUpdate({ _id: mentor_id }, { $set: { "details.rating.rate": sched.rating.rate } }, { new: true });

        // return res.json({ success: true, msg: "Rate submitted!" })


    } catch (error) {
        return res.status(500).json({ success: false, msg: "Mentor not rated", error: "Server Error", error })
    }
}


module.exports = { 
    enrollMentee,
    getMentor,
    checkIfEnrolled,
    approveSchedule,
    rateMentor
}