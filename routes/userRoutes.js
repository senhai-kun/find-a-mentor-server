const router = require("express").Router();
const validateSession = require("../middlewares/validateSession");
const {
    loginSanitizer,
    registerSanitizer,
    sanitizerResult,
} = require("../middlewares/sanitizeInput");
const {
    loginController,
    registerController,
    logoutController,
} = require("../controller/loginController");
const {
    sessionController,
    profileImgController,
    find,
    updateUserProfile,
    getUserProfile
} = require("../controller/userController");
const { getAllMentors, getMentorProfile, updateMentorProfile, getSchedule, addSchedule, doneSchedule } = require("../controller/mentorController");
const { enrollMentee, getMentor, checkIfEnrolled, approveSchedule, rateMentor } = require("../controller/menteeController");

// routes
router.get("/", (req, res) => {
    return res.send({ msg: "Server is running..." });
});

router.get("/find", find);
router.get("/mentors", getAllMentors);

router.get("/mentor/:ref_id", getMentorProfile);
router.get("/mentor/schedule/list", getSchedule);
router.post("/mentor/schedule", addSchedule);
router.get("/mentor/schedule/done/:sched_id", doneSchedule);

router.get("/mentee/mentor", getMentor);
router.post("/mentee/schedule/approved", validateSession, approveSchedule);
router.get("/mentee/:mentee_ref_id/mentor/:mentor_ref_id/enrolled", checkIfEnrolled);
router.post("/mentee/enroll", validateSession, enrollMentee);
router.post("/mentee/rate", validateSession, rateMentor);

router.post("/user/:ref_id", validateSession, getUserProfile);


router.post("/account/uploadimage", validateSession, profileImgController);
router.post("/account/update_profile", validateSession, updateUserProfile);

router.get("/account/ses", validateSession, sessionController);

router.post("/account/update_mentor", validateSession, updateMentorProfile);

router.post("/account/login", loginSanitizer, sanitizerResult, loginController);

router.post("/account/register", registerSanitizer, sanitizerResult, registerController);

router.get("/account/logout", (req, res, next) => {
    // res.clearCookie("fam-ses", { path: '/' });
    res.clearCookie("fam-ses");
    console.log("logging out");
    req.session.destroy( (err) => {
        console.log("logout: ", err)
    })
    // next();
    return res.json({ logout: "true" });
} ,logoutController);


module.exports = router;
