const express = require("express");

const {
    getGroups,
    createPersonalChat,
    createGroup,
    addMember,
    removeMember,
    leaveGroup,
    updateGroup,
    deleteGroup
} = require("../controllers/group");

const { requireSignin } = require("../middlewares/auth");

const {
    isRequestValidated,
    validateGroupRequest
} = require("../validators/group");

const router = express.Router();

router.get("/", requireSignin, getGroups);

router.post("/:id/personal", requireSignin, createPersonalChat);

router.post("/", requireSignin, validateGroupRequest, isRequestValidated, createGroup);

router.put("/:friend_id/add/:group_id", requireSignin, addMember);

// router.put("/:user_id/remove", requireSignin, removeMember);

router.put("/:group_id/leave", requireSignin, leaveGroup);

router.put("/:group_id", requireSignin, validateGroupRequest, isRequestValidated, updateGroup);

router.delete("/:group_id", requireSignin, deleteGroup);

module.exports = router;