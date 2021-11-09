const express = require("express");

const {
    getGroups,
    getChats,
    createPersonalChat,
    createGroup,
    joinGroup,
    leaveGroup,
    updateGroup,
    deleteGroup
} = require("../controllers/group");

const { requireSignin } = require("../middlewares/auth");

const {
    isRequestValidated,
    validatePersonalChatRequest,
    validateGroupRequest,
    validateGroupUpdateRequest,
    validateGroupLeaveRequest,
    validateGroupDeleteRequest,
    validateGroupJoinRequest
} = require("../validators/group");

const router = express.Router();

router.get("/getGroups", requireSignin, getGroups);

router.get("/getChats", requireSignin, getChats);

router.post("/personal", requireSignin, validatePersonalChatRequest, isRequestValidated, createPersonalChat);

router.post("/createGroup", requireSignin, validateGroupRequest, isRequestValidated, createGroup);

router.put("/joinGroup", requireSignin, validateGroupJoinRequest, isRequestValidated, joinGroup);

router.put("/leave", requireSignin, validateGroupLeaveRequest, isRequestValidated, leaveGroup);

router.put("/updateGroup", requireSignin, validateGroupUpdateRequest, isRequestValidated, updateGroup);

router.delete("/deleteGroup", requireSignin, validateGroupDeleteRequest, isRequestValidated, deleteGroup);

module.exports = router;