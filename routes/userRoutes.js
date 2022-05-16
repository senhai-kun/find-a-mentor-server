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
} = require("../controller/userController");
// const { cloudinary } = require("../helper/cloudinary");

// routes
router.get("/", (req, res) => {
    return res.send({ msg: "Server is running..." });
});

router.post("/account/uploadimage", validateSession, profileImgController);

// router.get("/find", (req, res) => {
//     cloudinary.search
//         .expression("filename:myo4ddfdafyagxk6sk2i")
//         .execute()
//         .then((result) => {
//             console.log(result);
//             return res.json({ ok: "ok", result });
//         })
//         .catch((error) => console.log(error));
// });

router.get("/account/ses", validateSession, sessionController);

router.get("/account/logout", logoutController);

router.post("/account/login", loginSanitizer, sanitizerResult, loginController);

router.post(
    "/account/register",
    registerSanitizer,
    sanitizerResult,
    registerController
);

module.exports = router;
