if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const { Client } = require('pg');
var fs = require('fs');

const client = new Client({
    database: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

const app = express();

const PORT = process.env.PORT | 5000;

app.get("/", (req, res) => {
    res.send("Helo!");
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
