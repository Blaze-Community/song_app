const db = require("../config/db");

exports.getUser = async (req, res) => {

    try {

        const { id } = req.params;

        const { rows } = await db.query(
            `SELECT user_id, name, dob, email, address 
             from users 
             where user_id = $1;`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "No such user exists!",
            });
        }

        return res.status(200).json({
            success: true,
            user: rows[0],
            msg: "User fetched Successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.allUser = async (req, res) => {

    try {

        const { rows } = await db.query(
            `SELECT user_id, name, dob, email, address 
             from users;`
        );

        return res.status(200).json({
            success: true,
            usersList: rows,
            msg: "User fetched Successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.getCurrentUser = async (req, res) => {

    try {
        const { user_id } = req.user;

        const { rows } = await db.query(
            `SELECT user_id, name, dob, email, address 
             from users 
             where user_id = $1;`,
            [user_id]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "No such user exists!",
            });
        }

        return res.status(200).json({
            success: true,
            user: rows[0],
            msg: "User fetched Successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};
exports.updateUser = async (req, res) => {

    try {
         const { user_id } = req.user;

        const {
            name,
            address,
            dob
        } = req.body.userInfo;
        // user cannot change the email address the account is linked with

        const { rows } = await db.query(
            `SELECT * 
             from users 
             where user_id = $1;`,
            [user_id]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "No such user exists!",
            });
        }

        await db.query(
            `UPDATE users
             SET name = $1, dob = $2, address = $3
             where user_id = $4;`,
            [name, dob, address, user_id]
        );

        return res.status(200).json({
            success: true,
            msg: "User Updated Successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.deleteUser = async (req, res) => {

    try {

        const { user_id } = req.user;

        const { rows } = await db.query(
            `SELECT * 
             from users 
             where user_id = $1;`,
            [user_id]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "No such user exists!",
            });
        }

        await db.query(
            `DELETE 
             FROM friends
             where user_id = $1 OR friend_id = $1;`,
            [user_id]
        );

        await db.query(
            `DELETE 
             FROM friends
             where user_id = $1 OR friend_id = $1;`,
            [user_id]
        );
        await db.query(
            `DELETE 
             FROM users
             where user_id = $1;`,
            [user_id]
        );

        return res.status(200).json({
            success: true,
            msg: "User Deleted Successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};