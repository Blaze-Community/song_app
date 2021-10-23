if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect(function (err) {
    if (err) throw err;
    console.log('Connected!');
});

client.query(
    `select table_name from information_schema.tables where table_schema='public';`
    , (err, res) => {
        if (err) throw err;
        console.log(res);
        client.end();
    }
);

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Helo!");
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
