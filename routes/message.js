const express = require("express");
const {
    getMessages,
    sendMessage,
    updateMessage,
    deleteMessage
} = require("../controllers/message");

const { requireSignin } = require("../middlewares/auth");
const {
    isRequestValidated,
    validateMessageUpdateRequest,
    validateMessageSentRequest,
} = require("../validators/message");


const router = express.Router();

router.get("/:id", requireSignin, getMessages);
router.post("/", requireSignin,validateMessageSentRequest,isRequestValidated,sendMessage);
router.put("/",requireSignin,validateMessageUpdateRequest,isRequestValidated,updateMessage);
router.delete("/", requireSignin, deleteMessage);

module.exports = router;