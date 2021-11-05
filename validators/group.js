const { check, validationResult } = require('express-validator');

exports.validateGroupRequest = [
    check("name").notEmpty().withMessage("Name must not be empty"),
    check("artist").notEmpty().withMessage("Artist must not be empty"),
];

exports.isRequestValidated = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};