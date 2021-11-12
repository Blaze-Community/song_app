const { check, validationResult } = require('express-validator');

exports.validateMessageUpdateRequest = [
    check("body").notEmpty().withMessage("body must not be empty"),
    check("msg_id").notEmpty().withMessage("Message id must not be empty"),
];

exports.validateMessageSentRequest = [
    check("group_id").notEmpty().withMessage("Group must not be empty"),
    check("body").notEmpty().withMessage("body must not be empty"),
];


exports.isRequestValidated = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};