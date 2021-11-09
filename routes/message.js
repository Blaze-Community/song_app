const express = require("express");
const {
    getMessages,
    sendMessage,
    updateMessage,
    deleteMessage
} = require("../controllers/message");

const { requireSignin } = require("../middlewares/auth");

router.get("/getMessages", requireSignin, getMessages);
router.post("/sendMessage", requireSignin, sendMessage);
router.update("/updateMessage",requireSignin, updateMessage);
router.post("/deleteMessage", requireSignin, deleteMessage);

const router = express.Router();

module.exports = router;