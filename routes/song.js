const express = require("express");
const { reset } = require("nodemon");
const { allSongs , addToFav , removeFromFav , allFavSongs} = require("../controllers/song");
const { requireSignin } = require("../middlewares/auth");
const {
    isRequestValidated,
} = require("../validators/auth");

const router = express.Router();

router.get("/allSongs",isRequestValidated, allSongs);
router.get("/allFavSongs",isRequestValidated,requireSignin, allFavSongs);
router.post("/addToFav",isRequestValidated, requireSignin , addToFav);
router.delete("/removeFromFav",isRequestValidated, requireSignin , removeFromFav);

module.exports = router;
