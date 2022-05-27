const { body, validationResult } = require("express-validator");

const loginSanitizer = [
    body("email")
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage("Invalid email"),
    body("password")
        .isLength({ min: 3 })
        .trim()
        .escape()
        .withMessage("Invalid password"),
];

const registerSanitizer = [
    body("firstname")
        .notEmpty()
        .trim()
        .isString()
        .toLowerCase()
        .withMessage("Invalid firstname"),
    body("lastname")
        .notEmpty()
        .trim()
        .isString() 
        .toLowerCase()
        .withMessage("Invalid lastname"),
    body("email").trim().isEmail().normalizeEmail(),
    body("password").isLength({ min: 3 }).trim().escape(),
    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password confirmation does not match password");
        }
        // password matched
        return true;
    }),
];

const sanitizerResult = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next(); // no errors continue
    }

    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

    req.session.destroy(); // destroy unwanted session

    return res.status(422).json({ success: false, errors: extractedErrors });
};

module.exports = {
    loginSanitizer,
    registerSanitizer,
    sanitizerResult,
};
