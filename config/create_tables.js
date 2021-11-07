require('dotenv').config({ path: '../.env' });

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

// run heroku pg:reset DATABASE on cli to clear database
// then run this file to feed data


const create_tables = async () => {

    try {

        await pool.query(
            `CREATE TABLE users (
                name text NOT NULL,
                email text UNIQUE NOT NULL,
                address text NOT NULL,
                dob date NOT NULL,
                password text NOT NULL,
                user_id SERIAL,
                CONSTRAINT USR_PK PRIMARY KEY(user_id)
            );`
        );

        await pool.query(
            `CREATE TABLE artist(
                name text NOT NULL,
                artist_id SERIAL,
                CONSTRAINT ARTIST_PK PRIMARY KEY(artist_id)
            );`
        );

        await pool.query(
            `CREATE TABLE album(
                name text NOT NULL,
                album_id SERIAL,
                artist_id integer NOT NULL,
                CONSTRAINT ALBUM_PK PRIMARY KEY(album_id),
                CONSTRAINT ARTIST_FK FOREIGN KEY (artist_id) REFERENCES artist(artist_id)
            );`
        );

        await pool.query(
            `CREATE TABLE songs(
                title text NOT NULL,
                year date NOT NULL,
                song_id SERIAL,
                album_id integer NOT NULL,
                CONSTRAINT SONG_PK PRIMARY KEY(song_id),
                CONSTRAINT ALBUM_FK FOREIGN KEY (album_id) REFERENCES album(album_id),
                CONSTRAINT SONG_UK UNIQUE (year , title)
            );`
        );

        await pool.query(
            `CREATE TABLE group_name(
                type text CHECK(type IN ('single','group')) NOT NULL,
                name text,
                artist text,
                group_id SERIAL,
                CONSTRAINT GRP_PK PRIMARY KEY(group_id)
            );`
        );

        await pool.query(
            `CREATE TABLE message(
                from_user integer,
                to_user integer,
                msg_id integer,
                body text NOT NULL,
                subject text NOT NULL,
                CONSTRAINT MSG_PK PRIMARY KEY(msg_id),
                CONSTRAINT FRM_FK FOREIGN KEY (from_user) REFERENCES users(user_id),
                CONSTRAINT TO_FK FOREIGN KEY (to_user) REFERENCES group_name(group_id)
            );`
        );
        
        await pool.query(
            `CREATE TABLE deleted_message(
                user_id integer,
                msg_id integer,
                CONSTRAINT DMS_PK PRIMARY KEY(user_id,msg_id),
            );`
        );

        await pool.query(
            `CREATE TABLE group_user(
                user_id integer NOT NULL,
                group_id integer NOT NULL,
                CONSTRAINT USERID_FK FOREIGN KEY (user_id) REFERENCES users(user_id),
                CONSTRAINT GRPID_FK FOREIGN KEY (group_id) REFERENCES group_name(group_id),
                CONSTRAINT GROUP_USER_PK PRIMARY KEY(user_id,group_id)
            );`
        );

        await pool.query(
            `CREATE TABLE friends(
                user_id integer NOT NULL,
                friend_id integer NOT NULL,
                status CHAR(1) CHECK(status IN ('0', '1', '2')) NOT NULL,
                CONSTRAINT USERID_FRIENDS_FK FOREIGN KEY (user_id) REFERENCES users(user_id),
                CONSTRAINT FREINDID_FK FOREIGN KEY (friend_id) REFERENCES users(user_id),
                CONSTRAINT FREINDS_PK PRIMARY KEY(user_id,friend_id)
            );`
        );
        // 0 means user_id sent friend request to friend_id and is pending
        // 2 means user_id got friend request from friend_id and is pending
        // 1 means friendship has been established

        await pool.query(
            `CREATE TABLE fav_songs(
                user_id integer NOT NULL,
                song_id integer NOT NULL,
                CONSTRAINT USERID_SONG_FK FOREIGN KEY (user_id) REFERENCES users(user_id),
                CONSTRAINT SONGID_FK FOREIGN KEY (song_id) REFERENCES songs(song_id),
                CONSTRAINT FAVSONG_PK PRIMARY KEY(user_id,song_id)
            );`
        );

        const res = await pool.query(
            `select table_name from information_schema.tables where table_schema='public';`
        );

        console.log(res);

        await pool.end();

    } catch (e) {
        console.log(e);
    }
};

create_tables();