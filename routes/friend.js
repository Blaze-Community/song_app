const express = require("express");

const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unFriend,
    getFriends,
    getFriendRequests
} = require("../controllers/friend");

const { requireSignin } = require("../middlewares/auth");

const {
    validateFriendRequest,
    isRequestValidated
} = require("../validators/friend");

const router = express.Router();


router.get("/", requireSignin, getFriends);

router.delete("/", requireSignin, validateFriendRequest, isRequestValidated, unFriend);

router.get("/requests", requireSignin, getFriendRequests);

router.post("/requests", requireSignin, validateFriendRequest, isRequestValidated, sendFriendRequest);

router.delete("/requests", requireSignin, validateFriendRequest, isRequestValidated, rejectFriendRequest);

router.put("/requests", requireSignin, validateFriendRequest, isRequestValidated, acceptFriendRequest);


module.exports = router;

// later on we can add option to unsend friend request and get all send friend requests