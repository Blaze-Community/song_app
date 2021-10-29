const express = require("express");

const {
    getUser,
    updateUser,
    deleteUser
} = require("../controllers/user");

const { requireSignin } = require("../middlewares/auth");

const {
    validateUserRequest,
    isRequestValidated
} = require("../validators/user");

const router = express.Router();

router.get("/:id", getUser);

router.patch("/:id", requireSignin, validateUserRequest, isRequestValidated, updateUser);

router.delete("/:id", requireSignin, deleteUser);

module.exports = router;

// can add change password and reset password here