const express = require("express");
const { reset } = require("nodemon");
const {
    login,
    register,
    refresh,
    userInfo,
    editProfile,
    changePassword,
    resetPassword,
    resetPasswordForm,
    requestResetPassword,
} = require("../controllers/auth");
const { requireSignin } = require("../middlewares/auth");
const {
    validateLoginRequest,
    validateRefreshRequest,
    isRequestValidated,
    validateRegisterRequest,
} = require("../validators/auth");

const router = express.Router();

router.post("/login", validateLoginRequest, isRequestValidated, login);

router.post("/register", validateRegisterRequest, isRequestValidated, register);

router.post("/refresh", validateRefreshRequest, isRequestValidated, refresh);

router.post("/changepassword", requireSignin, changePassword);

router.post("/requestResetPassword", requestResetPassword);

router.get("/resetPassword/:id/:token", resetPasswordForm);

router.post("/resetPassword/:id", resetPassword);

module.exports = router;
