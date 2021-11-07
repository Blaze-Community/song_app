const express = require("express");

const {
    getGroups,
    createPersonalChat,
    createGroup,
    addMember,
    leaveGroup,
    updateGroup,
    deleteGroup
} = require("../controllers/group");

const { requireSignin } = require("../middlewares/auth");

const {
    isRequestValidated,
    validatePersonalChatRequest,
    validateAddMemberRequest,
    validateGroupRequest,
    validateGroupUpdateRequest,
    validateGroupLeaveRequest,
    validateGroupDeleteRequest
} = require("../validators/group");

const router = express.Router();

router.get("/", requireSignin, getGroups);

router.post("/personal", requireSignin, validatePersonalChatRequest, isRequestValidated, createPersonalChat);

router.post("/", requireSignin, validateGroupRequest, isRequestValidated, createGroup);

router.put("/add", requireSignin, validateAddMemberRequest, isRequestValidated, addMember);

// router.put("/:user_id/remove", requireSignin, removeMember);

router.put("/leave", requireSignin, validateGroupLeaveRequest, isRequestValidated, leaveGroup);

router.put("/", requireSignin, validateGroupUpdateRequest, isRequestValidated, updateGroup);

router.delete("/", requireSignin, validateGroupDeleteRequest, isRequestValidated, deleteGroup);

module.exports = router;