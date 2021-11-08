const express = require("express");
const { reset } = require("nodemon");
const { allSongs , addToFav , removeFromFav , allFavSongs, songDetail} = require("../controllers/song");
const { requireSignin } = require("../middlewares/auth");
const {
    validateSongRequest,
    isRequestValidated,
} = require("../validators/song");

const router = express.Router();

router.get("/allSongs",allSongs);
router.get("/:id",songDetail);
router.get("/allFavSongs",requireSignin, allFavSongs);
router.post("/addToFav",requireSignin, validateSongRequest, addToFav);
router.delete("/removeFromFav",requireSignin, removeFromFav);

module.exports = router;
