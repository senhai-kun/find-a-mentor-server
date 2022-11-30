const router = require("express").Router();
const validateSession = require("../middlewares/validateSession");
const {
    getAllMentors,
    getMentorProfile,
    updateMentorProfile,
    getSchedule,
    addSchedule,
    cancelSchedule,
    doneSchedule,
    searchMentor,
    acceptMentee
} = require("../controller/mentorController");

router.get("/mentors", getAllMentors);
router.get("/search/mentor", searchMentor);

router.post("/mentor/accept", validateSession, acceptMentee)
router.get("/mentor/:ref_id", getMentorProfile);
router.get("/mentor/schedule/list", getSchedule);
router.post("/mentor/schedule", validateSession, addSchedule);
router.get("/mentor/schedule/cancel/:sched_id", validateSession, cancelSchedule);
router.get("/mentor/schedule/done/:sched_id", validateSession, doneSchedule);

router.post("/account/update_mentor", validateSession, updateMentorProfile);

module.exports = router;
