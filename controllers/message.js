const db = require("../config/db")

exports.getMessages = async (req, res) => {
    try {
        const  { user_id }  = req.user;
        const  group_id = req.params.id;

        const response = await db.query(
           `SELECT 
        message.msg_id as msg_id,
        message.to_user as to_user,
        message.from_user as from_user, 
        message.body as body FROM message 
        where to_user = $2 and
        (select COUNT(*) from deleted_message where deleted_message.user_id =  $1
        and deleted_message.msg_id =  message.msg_id) = 0 ORDER BY message.msg_id;`,
            [user_id, group_id]
        );

        const messages = response.rows;

        return res.status(200).json({
            success: true,
            messagesList: messages,
            msg: "Message fetched successfully!",
        });
    }
    catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { group_id, body } = req.body;

        await db.query(
            `INSERT INTO message (from_user,to_user,body) 
            values($1,$2,$3);`,
            [user_id, group_id, body]
        );

        return res.status(200).json({
            success: true,
            msg: "Message sent successfully!",
        });
    }
    catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.updateMessage = async (req, res) => {
    try {

        const { msg_id, body } = req.body;

        await db.query(
            `UPDATE message SET body = $2
            WHERE msg_id = $1;`,
            [msg_id, body]
        );

        return res.status(200).json({
            success: true,
            msg: "Message updated successfully!",
        });

    } catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
}
exports.deleteMessage = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { msg_id } = req.body;

        await db.query(
            `INSERT INTO deleted_message
            values($1,$2);`,
            [user_id, msg_id]
        );

        return res.status(200).json({
            success: true,
            msg: "Message deleted successfully!",
        });
    }
    catch (e) {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};