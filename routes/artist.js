const express = require("express");

const { allArtists,allSongs,artistDetail} = require("../controllers/artist");

const router = express.Router();

router.get("/allArtists",allArtists);
router.get("/:id",artistDetail);
router.get("/allSongs/:id",allSongs);

module.exports = router;
