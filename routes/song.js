const express = require("express");
const { reset } = require("nodemon");
const { allSongs , addToFav , removeFromFav , allFavSongs, songDetail, isFav} = require("../controllers/song");
const { requireSignin } = require("../middlewares/auth");
const {
    validateSongRequest,
    isRequestValidated,
} = require("../validators/song");

const router = express.Router();

router.get("/allSongs",allSongs);
router.get("/isFav/:id",requireSignin,isFav);
router.get("/allFavSongs",requireSignin, allFavSongs);
router.post("/addToFav",requireSignin, validateSongRequest, addToFav);
router.delete("/removeFromFav",requireSignin,validateSongRequest, removeFromFav);
router.get("/:id",songDetail);

module.exports = router;
