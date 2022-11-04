const router = require("express").Router();
const validateSession = require("../middlewares/validateSession");
const {
    enrollMentee,
    getMentor,
    checkIfEnrolled,
    approveSchedule,
    rateMentor,
} = require("../controller/menteeController");

router.get("/mentee/mentor", getMentor);
router.post("/mentee/schedule/approved", validateSession, approveSchedule);
router.get("/mentee/:mentee_ref_id/mentor/:mentor_ref_id/enrolled",checkIfEnrolled);
router.post("/mentee/enroll", validateSession, enrollMentee);
router.post("/mentee/rate", validateSession, rateMentor);

module.exports = router;
