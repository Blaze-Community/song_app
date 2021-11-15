const { check, validationResult } = require('express-validator');

exports.validateUserRequest = [
    check("userInfo.name").notEmpty().withMessage("Name must not be empty"),
    check("userInfo.address").notEmpty().withMessage("Adress must not be empty"),
    check("userInfo.dob").notEmpty().withMessage("Date of birth must not be empty"),
];

exports.isRequestValidated = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};