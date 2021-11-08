const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../config/db");

const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;

exports.register = async (req, res) => {

    try {
        const {
            name,
            email,
            address,
            dob,
            password
        } = req.body.userInfo;

        const { rows } = await db.query(
            `SELECT * 
             from users 
             where email = $1;`,
            [email]
        );

        if (rows.length !== 0) {
            return res.status(400).json({
                success: false,
                msg: "User with this email already exists!",
            });
        }

        const _password = await hashPassword(password);
        
        const response = await db.query(
            `INSERT INTO users
             (name, email, address, dob, password)
             values ($1, $2, $3, $4, $5)
             RETURNING *;`,
            [name, email, address, dob, _password]
        );

        const user = response.rows;

        delete user[0]['password'];

        const accessToken = jwt.sign(
            {
                user: user[0]
            },
            JWT_AUTH_TOKEN,
            {
                expiresIn: "600s",
            }
        );

        const refreshToken = jwt.sign(
            {
                user: user[0]
            },
            JWT_REFRESH_TOKEN,
            {
                expiresIn: "1y",
            }
        );

        return res.status(200).json({
            success: true,
            msg: "Registered successfully!",
            userInfo: user[0],
            accessToken: accessToken,
            refreshToken: refreshToken,
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.login = async (req, res) => {

    try {
        const {
            email,
            password
        } = req.body.userInfo;

        const { rows } = await db.query(
            `SELECT *
             from users 
             where email = $1;`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Invalid email or password!",
            });
        }

        const saved_password = rows[0].password;

        const isMatch = await comparePassword(password, saved_password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                msg: "Invalid email or password!",
            });
        }

        delete rows[0]['password'];

        const accessToken = jwt.sign(
            {
                user: rows[0]
            },
            JWT_AUTH_TOKEN,
            {
                expiresIn: "600s",
            }
        );
        const refreshToken = jwt.sign(
            {
                user: rows[0]
            },
            JWT_REFRESH_TOKEN,
            {
                expiresIn: "1y",
            }
        );
        return res.status(200).json({
            success: true,
            msg: "Login successful",
            userInfo: rows[0],
            accessToken: accessToken,
            refreshToken: refreshToken,
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.refresh = (req, res) => {

    const refreshToken = req.body.token;

    jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN,
        (err, data) => {
            if (!err) {

                const accessToken = jwt.sign(
                    { user: data.user },
                    process.env.JWT_AUTH_TOKEN,
                    {
                        expiresIn: "600s",
                    }
                );

                return res.status(200).json({
                    success: true,
                    accessToken: accessToken
                });

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

// set new password
exports.changePassword = async (req, res) => {

    try {

        const {
            password,
            newPassword
        } = req.body.userInfo;

        const { email } = req.user;

        const { rows } = await db.query(
            `SELECT *
             from users 
             where email = $1;`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Invalid email!",
            });
        }

        const saved_password = rows[0].password;

        const isMatch = await comparePassword(password, saved_password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                msg: "Invalid password!",
            });
        }

        const hashed_password = await hashPassword(newPassword);

        await db.query(
            `UPDATE users
                 SET password = $1
                 where email = $2;`,
            [hashed_password, email]
        );

        return res.status(200).json({
            success: true,
            msg: "Password Change Successfully!",
        });

    } catch (e) {

        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.requestResetPassword = async (req, res) => {

    try {

        let token = crypto.randomBytes(32).toString("hex");

        const resetToken = jwt.sign(
            { token: token },
            JWT_AUTH_TOKEN,
            {
                expiresIn: "600s",
            }
        );

        let { email } = req.body;

        const { rows } = await db.query(
            `SELECT *
             from users 
             where email = $1;`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Invalid email!",
            });
        }

        const id = rows[0].user_id;

        let link = `http://localhost:5000/api/resetPassword/${id}/${resetToken}`;

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.SENDER_PASSWORD,
            },
        });

        let mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Password Reset - SONG APP",
            text: `Here's the link to reset your password - ${link}`,
        };

        transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
                return res.status(400).json({
                    error: err,
                    success: false,
                    msg: "Something Went Wrong!",
                });
            } else {
                res.status(200).json({
                    success: true,
                    msg: "email sent successfully",
                });
            }
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }

};

exports.resetPasswordForm = (req, res) => {

    jwt.verify(
        req.params.token,
        JWT_AUTH_TOKEN,
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

// reset password on forgetting
exports.resetPassword = async (req, res) => {

    try {
        const { reenterNewPassword, newPassword } = req.body;
        const { id } = req.params;

        if (reenterNewPassword != newPassword) {
            return res.status(400).json({
                error: err,
                success: false,
                msg: "Password Dont Match",
            });
        }
        else {
            const hashedPassword = await hashPassword(newPassword);

            await db.query(
                `UPDATE users
                     SET password = $1
                     where user_id = $2;`,
                [hashedPassword, id]
            );

            return res.status(200).json({
                success: true,
                newPassword: req.body.newPassword,
                msg: "Password Reset Successfully",
            });
        }

    } catch (e) {

        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};
