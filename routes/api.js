const express = require("express");
const router = express.Router();

router.get("/health", function(req,res){
  res.send("hello");
});

module.exports = router;