const express = require("express");
const { getSongs , getUsers , getGroups} = require("../controllers/search");

const router = express.Router();

router.get("/song/",getSongs);
router.get("/user/",getUsers);
router.get("/group/",getGroups);

module.exports = router;
