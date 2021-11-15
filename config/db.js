if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('connect', () => {
    console.log('Connected!');
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};