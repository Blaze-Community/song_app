const express = require("express");

const {
    sendFriendRequest,
    acceptFriendRequest,
    unFriend,
    getFriends,
    getFriendRequests
} = require("../controllers/friend");

const { requireSignin } = require("../middlewares/auth");

const router = express.Router();

router.get("/requests", requireSignin, getFriendRequests);

router.get("/", requireSignin, getFriends);

router.post("/:friend_id", requireSignin, sendFriendRequest);

router.put("/:friend_id", requireSignin, acceptFriendRequest);

router.delete("/:friend_id", requireSignin, unFriend);

module.exports = router;

// later on we can add option to unsend friend request and get all send friend requests