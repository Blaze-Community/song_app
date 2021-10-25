const express = require("express");
const jwt = require("jsonwebtoken");
const { hashPassword } = require("./hashPassword");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;

exports.register = async (req, res) => {
    const { userInfo } = req.body;
    userInfo.password = await hashPassword(userInfo.password);
    const accessToken = jwt.sign({ user: userInfo }, JWT_AUTH_TOKEN, {
        expiresIn: "600s",
    });
    const refreshToken = jwt.sign(
        { user: userInfo },
        JWT_REFRESH_TOKEN,
        {
            expiresIn: "1y",
        }
    );
    return res.status(200).send({
      success: true,
      msg: "Successfully created",
      userInfo: userInfo,
      accessToken : accessToken,
      refreshToken : refreshToken,
    });
};

exports.login = (req, res) => {
    const { userInfo } = req.body;
    bcrypt.compare(userInfo.password,"$2b$10$Bf06Xvlbso5MC8g04sE0oupfdEW06TkkDqHizboNAzt9zBO7hvfJO", function (err, isMatch) {
        console.log(isMatch);
        if (err) {
            return res.status(400).send({
                error: err,
                success: false,
                msg: "Something Went Wrong!",
            });
        }
        if(isMatch) {
            const accessToken = jwt.sign({ user: userInfo }, JWT_AUTH_TOKEN, {
                expiresIn: "600s",
            });
            const refreshToken = jwt.sign(
                { user: userInfo },
                JWT_REFRESH_TOKEN,
                {
                    expiresIn: "1y",
                }
            );
            return res.status(200).send({
              success: true,
              msg: "Successfully Logged In",
              userInfo: userInfo,
              accessToken : accessToken,
              refreshToken : refreshToken,
            });        
        }
        else{
            return res.status(400).send({
                error: err,
                success: false,
                msg: "Authorization Failed!",
            });            
        }
    });

};

exports.refresh = (req, res, next) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.json({ success: false, msg: "Refresh token not found." });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
        if (!err) {
            const accessToken = jwt.sign(
                { user: data.user },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "600s",
                }
            );
            return res
                .status(200)
                .json({ success: true, accessToken: accessToken });
        } else if (err.message == "jwt expired") {
            return res.status(400).json({
                success: false,
                msg: "Refresh token expired, Please Login again!",
            });
        } else {
            return res.status(400).json({
                success: false,
                msg: "invalid refresh token",
            });
        }
    });
};

exports.userInfo = (req, res) => {
};

exports.editProfile = (req, res) => {
};

exports.changePassword = (req, res) => {
    const { passwordInfo } = req.body;
    bcrypt.compare(passwordInfo.oldPassword,"$2b$10$Bf06Xvlbso5MC8g04sE0oupfdEW06TkkDqHizboNAzt9zBO7hvfJO", function (err, isMatch) {
        console.log(isMatch);
        if (err) {
            return res.status(400).send({
                error: err,
                success: false,
                msg: "Something Went Wrong!",
            });
        }
        if(isMatch) {
            return res.status(200).send({
              success: true,
              msg: "Password Change Successfully",
            });        
        }
        else{
            return res.status(400).send({
                error: err,
                success: false,
                msg: "Old Password is Not Correct!",
            });            
        }
    });
};

exports.requestResetPassword = async (req, res) => {
    let token = crypto.randomBytes(32).toString("hex");
    const hash = await hashPassword(token);
    const resetToken = jwt.sign({ token : hash}, "RESET PASSWORD", {
        expiresIn: "600s",
    });
    let _email = req.body.email;
    const id = 1;
    let link = `http://localhost:5000/api/resetPassword/${id}/${resetToken}`;
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "blazecommunity001@gmail.com",
            pass: "Fuckme123@@@",
        },
    });
    let mailOptions = {
        from: "blazecommunity001@gmail.com",
        to: _email,
        subject: "Password Reset - IIITN",
        text: `Here's the link to reset your password - ${link}`,
    };
    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            return res.status(400).send({
                error: err,
                success: false,
                msg: "Something Went Wrong!",
            });
        } else {
            res.status(200).send({
                success: true,
                msg: "email sent successfully",
            });
        }
    });

};

exports.resetPasswordForm = (req, res) => {
    jwt.verify(
        req.params.token,
        "RESET PASSWORD",
        async (err, data) => {
            if (data) {
            res.send(`<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>Document</title>
                    </head>
                    <body>
                        <form
                            action="http://localhost:5000/api/resetPassword/${req.params.id}"
                            method="POST"
                        >
                            <input name="newPassword" type="text" placeholder="new password" />
                            <input
                                name="reenterNewPassword"
                                type="text"
                                placeholder="re-enter new password"
                            />
                            <button type="submit">submit</button>
                        </form>
                    </body>
                </html>
                `);
            } else if (err.message === "jwt expired") {
                return res.json({
                    success: false,
                    msg: "Link Expired",
                });
            }
        }
    );
};

exports.resetPassword = async (req, res) => {
    if(req.body.reenterNewPassword != req.body.newPassword){
        return res.status(400).send({
            error: err,
            success: false,
            msg: "Password Dont Match",
        });   
    }
    else{
        const hastPassword = await hashPassword(req.body.newPassword);
        return res.status(200).send({
            success: true,
            newPassword : req.body.newPassword,
            msg: "Password Reset Successfully",
        });
    }  
};
