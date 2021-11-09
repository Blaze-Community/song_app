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

const app = express();

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
app.use("/api/message", group);
app.use("/api/artists", artist);


app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});