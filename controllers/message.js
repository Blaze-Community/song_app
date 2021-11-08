const db = require("../config/db")

exports.getMessages = async (req,res) => {
    try{
        const { user_id } = req.user;
        const { group_id } = req.body;

        const response = await db.query(
            `SELECT message.user_id, message.body FROM message 
            where group_id = $2 and 
            (select COUNT(*) from deleted_message where deleted_message.user_id =  $1
            and deleted_message.msg_id =  message.msg_id) = 0;`,
            [user_id,group_id]
        );

        const messages = response.rows;

        return res.status(200).json({
            success: true,
            message: messages,
            msg: "Message fetched successfully!",
        });
    }
    catch(e){
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.sendMessage = async (req , res) => {
    try{
        const { user_id } = req.user;
        const { group_id , body} = req.body;

        await db.query(
            `INSERT INTO message (from_user,to_user,body) 
            values($1,$2,$3);`,
            [user_id,group_id,body]
        );

        return res.status(200).json({
            success: true,
            msg: "Message sent successfully!",
        });
    }
    catch(e){
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};

exports.updateMessage = async (req, res) => {
    try{

        const {user_id} = req.user;
        const {group_id , msg_id , body} = req.body;

        await db.query(
            `UPDATE message SET body = $4
            WHERE user_id = $1 AND group_id = $2 AND msg_id = $3;`,
            [user_id,group_id, msg_id ,body]
        );

        return res.status(200).json({
            success: true,
            msg: "Message updated successfully!",
        });

    } catch(e)
    {
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
}
exports.deleteMessage = async (req , res) => {
    try{
        const { user_id } = req.user;
        const { msg_id } = req.body;

        await db.query(
            `INSERT INTO deleted_message
            values($1,$2);`,
            [user_id,msg_id]
        );

        return res.status(200).json({
            success: true,
            msg: "Message deleted successfully!",
        });
    }
    catch(e){
        return res.status(400).json({
            error: e,
            success: false,
            msg: "Something Went Wrong!",
        });
    }
};