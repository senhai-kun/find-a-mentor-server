const dbConn = require("../db/dbConn");
const mongoose = require("mongoose");
const { UsersAccount, Mentor, Schedule, MentoringList, Mentee } = require("../db/model");

const getAllMentors = async (req, res) => {
    try {
        await dbConn();

        const mentors = await Mentor.find({
            "profession": { $exists: true },
            "details.about": { $exists: true }
        }).sort({ "details.rating.rate": -1 })

        return res.json({ mentors })

    } catch (error) {
        return res.status(500).json({ error: "Server Error", error })
    }
}

const searchMentor = async (req, res) => {
    const { query } = req.query
    
    try {
        await dbConn();

        const mentors = await Mentor.find({ 
            $or: [
                { "firstname": { $regex: query, $options: "i" } }, 
                { "lastname": { $regex: query, $options: "i" } }, 
                { "profession": { $regex: query, $options: "i" } }, 
                { "details.skills": { $regex: query, $options: "i" } }
            ] }).sort({ "details.rating.rate": -1 })

        return res.json({mentors})

    } catch (error) {
        return res.status(500).json({ msg: "Server error from mentor search", error });
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
        
        if (!sched) return res.json({ msg: "schedule not found" })

        return res.json(sched);

    } catch (error) {

        return res.status(500).json({ success: false, msg: "schedule not found", error: "Server Error", error });
    }
}

const addSchedule = async (req, res) => {
    const { from, to, email } = req.body;

    const id = req.session.userID; // should be mentor id from session

    try {
        await dbConn();

        const mentee = await Mentee.findOne({ email });
        
        // const sched = await Schedule.findOneAndUpdate({ mentee: mentee._id }, { $set: { from: from, to: to } }, { new: true, upsert: true });

        await Schedule({
            from,
            to
        }).save( async (err, doc) => {
            if( err ) return res.status(400).json({ success: false, error: err, msg: "Schedule not added!" })

            const list = await MentoringList.findOneAndUpdate({ _id: id, "mentee._id": mentee._id }, { $push: { "mentee.$.schedule": [{ _id: doc._id }] } }, {new: true, upsert: true})

            if (!list) return res.json({ msg: "Schedule not udpated to mentee!" });

            return res.json(list);
        } )

        // if (!sched) return res.json({ msg: "Schedule not set!" });
        
        // const list = await MentoringList.findOneAndUpdate({ _id: id, "mentee._id": mentee._id }, { $push: { "mentee.$.schedule": [{ _id: sched._id }] } }, {new: true, upsert: true})
        
        // if (!list) return res.json({ msg: "Schedule not udpated to mentee!" });

        // return res.json(list);

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

const doneSchedule = async (req, res) => {
    const { sched_id } = req.params;

    try {
        await dbConn();

        const sched = await Schedule.findOneAndUpdate({ _id: sched_id }, { $set: { done: true } }, { new: true });

        return res.json({ success: true, sched, msg: "Schedule Done!" })

    } catch (error) {
        return res.status(500).json({ error: "schedule not updated to done", error });
    }

}


module.exports = { getAllMentors, getMentorProfile, updateMentorProfile, getSchedule, addSchedule, doneSchedule, searchMentor }
