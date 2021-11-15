if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const healthcheck = require("./routes/api");
const auth = require("./routes/auth");
const user = require("./routes/user");
const friend = require("./routes/friend");
const group = require("./routes/group");
const song = require("./routes/song");
const artist = require("./routes/artist");
const search = require("./routes/search");
const message = require("./routes/message");

const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

const db = require("./config/db");


app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(helmet());
app.use(
    cors({
        allowedHeaders: [
            "Content-Type",
            "token",
            "authorization",
            "*",
            "Content-Length",
            "X-Requested-With",
        ],
        origin: "*",
        preflightContinue: true,
    })
);
app.use(express.json({ limit: "1024mb" }));
app.use(express.urlencoded({ limit: "1024mb", extended: true }));
const PORT = process.env.PORT || 5000;

app.use("/api", healthcheck);
app.use("/api", auth);
app.use("/api/user", user);
app.use("/api/friends", friend);
app.use("/api/songs", song);
app.use("/api/groups", group);
app.use("/api/messages", message);
app.use("/api/artists", artist);
app.use("/api/search", search);

io.on("connection", async (socket) => {

    socket.on("openGroup", (group) => {
        socket.join(group.group_id);
    });

    socket.on("closeGroup", (group) => {
        socket.leave(group.group_id);
    });

    socket.on("recieveMessage", async (message) => {

        try {
            const {
                user_id,
                group_id,
                body
            } = message;

            const res = await db.query(
                `INSERT INTO message (from_user,to_user,body,subject) 
                 values($1,$2,$3,'chatMessage') RETURNING *;`,
                [user_id, group_id, body],
            );
            console.log(res.rows[0]);
            io.to(group_id).emit("sendMessage",res.rows[0]);

        } catch (e) {
            socket.to(message.group_id).emit("errorMessage", message);
        }

    });
});

// db.query(   `SELECT * from group_name;`,(err,data)=>{
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log(data);
//     }
// })

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});