const db = require("../config/db");

exports.groupInfo = async (req, res) => {
    try {
        const group_id = req.params.id;

        const groupMembers = await db.query(
            `SELECT users.user_id,users.name, dob, email, address FROM users INNER JOIN group_user
            ON group_user.user_id = users.user_id WHERE group_user.group_id = $1;`,
            [group_id]
        );

        const groupDetails = await db.query(
            `SELECT group_id, name, artist
             from group_name where group_id = $1;`,
            [group_id]
        );

        return res.status(200).json({
            success: true,
            groupDetails: groupDetails.rows[0],
            groupMembers: groupMembers.rows,
            msg: "Group fetched successfully!",
        });
    }
    catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
}

exports.getGroups = async (req, res) => {

    try {

        const { user_id } = req.user;

        const response = await db.query(
            `SELECT group_user.group_id as group_id, artist,name
             FROM group_user, group_name
             WHERE group_user.group_id = group_name.group_id 
             and user_id = $1 AND type = 'group';`,
            [user_id]
        );

        const groups = response.rows;

        return res.status(200).json({
            success: true,
            groupsList: groups,
            msg: "Groups fetched successfully!",
        });

    } catch (e) {
        console.log(e.toString());
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.getChats = async (req, res) => {

    try {

        const { user_id } = req.user;

        const response = await db.query(
            `SELECT group_id, artist,
             CASE
                WHEN type = 'single' THEN (
                    SELECT name 
                    FROM users 
                    WHERE user_id = (
                        SELECT user_id 
                        FROM group_user 
                        WHERE user_id <> $1 AND group_id = g.group_id
                    )
                )
                ELSE name
             END
             as name
             FROM group_user
             NATURAL JOIN group_name AS g
             WHERE user_id = $1 AND type = 'single';`,
            [user_id]
        );

        const groups = response.rows;

        return res.status(200).json({
            success: true,
            groups: groups,
            msg: "Groups fetched successfully!",
        });

    } catch (e) {
        console.log(e.toString());
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.createPersonalChat = async (req, res) => {

    try {
        const { user_id } = req.user;

        const { friend_id } = req.body;

        if (user_id === friend_id) {
            return res.status(400).json({
                success: false,
                msg: "Something went wrong!",
            });
        }

        // checks for friendship and fetches username at the same time
        const { rows } = await db.query(
            `SELECT name
             FROM users
             NATURAL JOIN friends 
             WHERE user_id = $1 AND friend_id = $2 AND status = '1';`,
            [friend_id, user_id]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "This user is not your friend or does not exist!",
            });
        }

        const response = await db.query(
            `INSERT INTO group_name
             (type) 
             VALUES ('single')
             RETURNING *;`
        );

        const group = response.rows;

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
            msg: "Personal chat created successfully!",
            group:
            {
                name: rows[0].name,
                group_id: group[0].group_id
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

exports.createGroup = async (req, res) => {

    try {

        const { user_id } = req.user;

        const {
            name,
            artist
        } = req.body;

        const response = await db.query(
            `INSERT INTO group_name
             (type, name, artist) 
             VALUES ('group', $1, $2)
             RETURNING *;`,
            [name, artist]
        );

        const group = response.rows;

        await db.query(
            `INSERT INTO group_user 
             values ($1, $2);`,
            [user_id, group[0].group_id]
        );

        return res.status(200).json({
            success: true,
            msg: "Group chat created successfully!",
            group: group[0]
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.joinGroup = async (req, res) => {

    try {

        const { user_id } = req.user;

        const { group_id } = req.body;

        const group = await db.query(
            `SELECT *
             FROM group_name
             WHERE group_id = $1 AND type = 'group';`,
            [group_id]
        );

        if (group.rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Group doesnot exist or is a personal chat!",
            });
        }

        const response = await db.query(
            `SELECT *
             FROM group_user 
             WHERE user_id = $1 AND group_id = $2;`,
            [user_id, group_id]
        );

        if (response.rows.length !== 0) {
            return res.status(400).json({
                success: false,
                msg: "This user is already in the group!",
            });
        }

        await db.query(
            `INSERT INTO group_user 
             VALUES ($1, $2);`,
            [user_id, group_id]
        );

        return res.status(200).json({
            success: true,
            msg: "Join Group successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.leaveGroup = async (req, res) => {

    try {

        const { user_id } = req.user;

        const { group_id } = req.body;

        const group = await db.query(
            `SELECT *
             from group_name
             where group_id = $1 AND type = 'group';`,
            [group_id]
        );

        if (group.rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Group doesnot exist or is a personal chat!",
            });
        }

        const response = await db.query(
            `SELECT *
             from group_user 
             where user_id = $1 AND group_id = $2;`,
            [user_id, group_id]
        );

        if (response.rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "You are not in this group!",
            });
        }

        await db.query(
            `DELETE 
             from group_user
             where user_id = $1 AND group_id = $2;`,
            [user_id, group_id]
        );

        return res.status(200).json({
            success: true,
            msg: "You left the group successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.updateGroup = async (req, res) => {

    try {
        const {
            name,
            artist,
            group_id
        } = req.body;

        const group = await db.query(
            `SELECT *
             FROM group_name
             WHERE group_id = $1 AND type = 'group';`,
            [group_id]
        );

        if (group.rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Group doesnot exist or is a personal chat!",
            });
        }

        await db.query(
            `UPDATE group_name
             SET name = $1, artist = $2
             WHERE group_id = $3;`,
            [name, artist, group_id]
        );

        return res.status(200).json({
            success: true,
            msg: "Update group successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.deleteGroup = async (req, res) => {

    try {
        const { group_id } = req.body;

        const { user_id } = req.user;

        const group = await db.query(
            `SELECT *
             FROM group_name
             WHERE group_id = $1 AND type = 'group';`,
            [group_id]
        );

        if (group.rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Group doesnot exist or is a personal chat!",
            });
        }

        const response = await db.query(
            `SELECT user_id
             FROM group_user
             WHERE group_id = $1;`,
            [group_id]
        );

        if (response.rows.length === 1 && response.rows[0].user_id === user_id) {

            await db.query(
                `DELETE
                 FROM group_user
                 WHERE group_id = $1;`,
                [group_id]
            );

            await db.query(
                `DELETE
                 FROM group_name
                 WHERE group_id = $1;`,
                [group_id]
            );

            return res.status(200).json({
                success: true,
                msg: "Deleted group successfully!",
            });
        }
        else {
            return res.status(400).json({
                success: false,
                msg: "Group cannot be deleted!",
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

exports.getGroupId = async (req, res) => {

    try {
        const { user_id } = req.user;

        const { friend_id } = req.params;

        const response = await db.query(
            `SELECT group_id from group_name where group_id IN  
            (SELECT group_id from group_user where user_id = $1
             INTERSECT
             SELECT group_id from group_user where user_id = $2) and type = 'single';`,
            [user_id, friend_id]
        );

        const group = response.rows;
        return res.status(200).json({
            success: true,
            groupId: group[0].group_id,
            msg: "Group Id fetched successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};