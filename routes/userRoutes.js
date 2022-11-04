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
    getUserProfile,
    sendEmail,
    changePassword,
    resetPasswordUrl,
    resetPassword,
    verifyUrlReset,
} = require("../controller/userController");

// routes
router.get("/", (req, res) => {
    return res.send({ msg: "Server is running..." });
});

router.get("/find", find);

router.post("/email", sendEmail);

router.post("/user/:ref_id", validateSession, getUserProfile);

router.post("/account/uploadimage", validateSession, profileImgController);
router.post("/account/update_profile", validateSession, updateUserProfile);

router.post("/account/change_password", validateSession, changePassword);
router.post("/account/reset/url", resetPasswordUrl);
router.post("/account/reset/verify", verifyUrlReset);
router.post("/account/reset/password", resetPassword);

router.get("/account/ses", validateSession, sessionController);

router.post("/account/login", loginSanitizer, sanitizerResult, loginController);

router.post(
    "/account/register",
    registerSanitizer,
    sanitizerResult,
    registerController
);

router.get(
    "/account/logout",
    (req, res, next) => {
        // res.clearCookie("fam-ses", { path: '/' });
        res.clearCookie("fam-ses");
        console.log("logging out");
        req.session.destroy((err) => {
            console.log("logout: ", err);
        });
        // next();
        return res.json({ logout: "true" });
    },
    logoutController
);

module.exports = router;
