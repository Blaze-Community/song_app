const express = require("express");
const {
    getMessages,
    sendMessage,
    deleteMessage
} = require("../controllers/message");

const { requireSignin } = require("../middlewares/auth");

router.get("/getMessages", requireSignin, getMessages);
router.post("/sendMessage", requireSignin, sendMessage);
router.update("/deleteMessage", requireSignin, deleteMessage);

const router = express.Router();

module.exports = router;