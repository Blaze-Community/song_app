const express = require("express");

const {
    getUser,
    getCurrentUser,
    updateUser,
    deleteUser,
    allUser
} = require("../controllers/user");

const { requireSignin } = require("../middlewares/auth");

const {
    validateUserRequest,
    isRequestValidated
} = require("../validators/user");

const router = express.Router();

router.get("/allUser", allUser);

router.get("/", requireSignin, getCurrentUser);

router.put("/", requireSignin, validateUserRequest, isRequestValidated, updateUser);

router.delete("/", requireSignin, deleteUser);

router.get("/:id", getUser);

module.exports = router;

// can add change password and reset password here