const { check, validationResult } = require('express-validator');

exports.validatePersonalChatRequest = [
    check("friend_id").notEmpty().withMessage("Friend id must not be empty"),
];

exports.validateGroupRequest = [
    check("name").notEmpty().withMessage("Name must not be empty"),
    check("artist").notEmpty().withMessage("Artist must not be empty"),
];

exports.validateAddMemberRequest = [
    check("group_id").notEmpty().withMessage("Group id must not be empty"),
    check("friend_id").notEmpty().withMessage("Friend id must not be empty"),
];

exports.validateGroupUpdateRequest = [
    check("name").notEmpty().withMessage("Name must not be empty"),
    check("artist").notEmpty().withMessage("Artist must not be empty"),
    check("group_id").notEmpty().withMessage("Group id must not be empty"),
];

exports.validateGroupLeaveRequest = [
    check("group_id").notEmpty().withMessage("Group id must not be empty"),
];

exports.validateGroupDeleteRequest = [
    check("group_id").notEmpty().withMessage("Group id must not be empty"),
];

exports.isRequestValidated = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};