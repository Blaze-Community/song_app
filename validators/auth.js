const { check, validationResult } = require('express-validator');

exports.validateRegisterRequest = [
    check("userInfo.email").notEmpty().withMessage("Invalid Email."),
    check("userInfo.password").notEmpty().withMessage("Password must be atleast 8 characters long"),
];

exports.validateLoginRequest = [
    check("userInfo.email").notEmpty().withMessage("Incorrect email or password."),
    check("userInfo.password").notEmpty().withMessage("Incorrect email or password."),
];

exports.isRequestValidated = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};