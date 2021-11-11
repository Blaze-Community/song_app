const db = require("../config/db");

exports.sendFriendRequest = async (req, res) => {

    try {

        const { user_id } = req.user;
        const { friend_id } = req.body;

        if (user_id === friend_id) {
            return res.status(400).json({
                success: false,
                msg: "You cannot send yourself a friend request!",
            });
        }

        const { rows } = await db.query(
            `SELECT *
             from users 
             where user_id = $1;`,
            [friend_id]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "No such user exists!",
            });
        }

        const response = await db.query(
            `SELECT status
             from friends
             where user_id = $1 AND friend_id = $2;`,
            [user_id, friend_id]
        );

        const friends = response.rows;

        if (friends.length !== 0) {
            if (friends[0].status === '0') {
                return res.status(400).json({
                    success: false,
                    msg: "You have already sent a friend request to this user!",
                });
            }
            else if (friends[0].status === '1') {
                return res.status(400).json({
                    success: false,
                    msg: "You are already friends with this user!",
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    msg: "This user has already sent you a friend request!",
                });
            }
        }

        await db.query(
            `INSERT INTO friends values ($1, $2, '0');`,
            [user_id, friend_id]
        );

        await db.query(
            `INSERT INTO friends values ($2, $1, '2');`,
            [user_id, friend_id]
        );

        return res.status(200).json({
            success: true,
            msg: "Friend Request sent successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.acceptFriendRequest = async (req, res) => {

    try {

        const { user_id } = req.user;
        const { friend_id } = req.body;


        if (user_id === friend_id) {
            return res.status(400).json({
                success: false,
                msg: "Something went wrong!",
            });
        }

        const { rows } = await db.query(
            `SELECT *
             from users 
             where user_id = $1;`,
            [friend_id]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "No such user exists!",
            });
        }

        const response = await db.query(
            `SELECT status
             from friends
             where user_id = $1 AND friend_id = $2;`,
            [user_id, friend_id]
        );

        const friends = response.rows;

        if (friends.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "This user has not sent you a friend request!",
            });
        }

        if (friends[0].status === '1') {
            return res.status(400).json({
                success: false,
                msg: "You are already friends with this user!",
            });
        }
        else if (friends[0].status === '0') {
            return res.status(400).json({
                success: false,
                msg: "Please wait for the user to accept your friend request!",
            });
        }

        await db.query(
            `UPDATE friends
             SET status = '1'
             WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1);`,
            [user_id, friend_id]
        );

        const resp = await db.query(
            `INSERT INTO group_name
             (type) 
             VALUES ('single')
             RETURNING *;`
        );

        const group = resp.rows;

        await db.query(
            `INSERT INTO group_user 
             VALUES ($1, $2);`,
            [friend_id, group[0].group_id]
        );

        await db.query(
            `INSERT INTO group_user 
             VALUES ($1, $2);`,
            [user_id, group[0].group_id]
        );

        return res.status(200).json({
            success: true,
            msg: "Accepted friend request successfully!"
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.unFriend = async (req, res) => {

    try {

        const { user_id } = req.user;
        const { friend_id } = req.body;

        const { rows } = await db.query(
            `SELECT *
             from users 
             where user_id = $1;`,
            [friend_id]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "No such user exists!",
            });
        }

        const response = await db.query(
            `SELECT status
             from friends
             where user_id = $1 AND friend_id = $2;`,
            [user_id, friend_id]
        );

        const friends = response.rows;

        if (friends.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "You are not friends with this user!",
            });
        }
        else {
            if (friends[0].status === '0' || friends[0].status === '2') {
                return res.status(400).json({
                    success: false,
                    msg: "You are not friends with this user!",
                });
            }
        }

        await db.query(
            `DELETE
             from friends
             WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1);`,
            [user_id, friend_id]
        );

        return res.status(200).json({
            success: true,
            msg: "Unfriended this user successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.getFriends = async (req, res) => {

    try {

        const { user_id } = req.user;

        const response = await db.query(
            `SELECT user_id, name, address
             from users
             where user_id IN (
                 SELECT friend_id
                 from friends
                 where user_id = $1 AND status = '1'
            );`,
            [user_id]
        );

        const friends = response.rows;

        return res.status(200).json({
            success: true,
            usersList: friends,
            msg: "Friends fetched successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.getFriendRequests = async (req, res) => {

    try {

        const { user_id } = req.user;

        const response = await db.query(
            `SELECT user_id, name, address
             from users
             where user_id IN (
                 SELECT friend_id
                 from friends
                 where user_id = $1 AND status = '2'
            );`,
            [user_id]
        );

        const friend_requests = response.rows;

        return res.status(200).json({
            success: true,
            requests: friend_requests,
            msg: "Friend Request fetched successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.rejectFriendRequest = async (req, res) => {

    try {

        const { user_id } = req.user;
        const { friend_id } = req.body;

        const { rows } = await db.query(
            `SELECT *
             from users 
             where user_id = $1;`,
            [friend_id]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "No such user exists!",
            });
        }

        const response = await db.query(
            `SELECT status
             from friends
             where user_id = $1 AND friend_id = $2;`,
            [user_id, friend_id]
        );

        const friends = response.rows;

        if (friends.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "This user has not sent you a friend request!",
            });
        }

        if (friends[0].status === '1') {
            return res.status(400).json({
                success: false,
                msg: "You are already friends with this user!",
            });
        }
        else if (friends[0].status === '0') {
            return res.status(400).json({
                success: false,
                msg: "Please wait for the user to accept your friend request!",
            });
        }

        await db.query(
            `DELETE FROM 
             friends
             WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1);`,
            [user_id, friend_id]
        );

        return res.status(200).json({
            success: true,
            msg: "Friend Request rejected successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};