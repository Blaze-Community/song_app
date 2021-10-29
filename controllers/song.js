const db = require("../config/db");

exports.allSongs = async(req,res) => {
	try {
		const { rows } = await db.query(
            `SELECT * 
             from songs;`
        );
        return res.status(200).json({
            success: true,
            msg: "Song Fetch Successfully!",
            songsList : rows,
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

exports.allFavSongs = async(req,res) => {
    try {
        const user_email = req.user.email ;
        const user = await db.query(
            `SELECT *
             from users 
             where email = $1;`,
            [ user_email ]
        );
        const user_id = user.rows[0].user_id;
        const { rows } = await db.query(
            `SELECT fav_songs.song_id,artist,title,year,album
            from fav_songs,songs 
            where user_id = $1 and 
            songs.song_id = fav_songs.song_id`,
            [ user_id]
        );
        return res.status(200).json({
            success: true,
            msg: "Song Fetch Successfully!",
            favSongsList : rows,
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

exports.addToFav = async(req,res) => {
    try {
        const user_email = req.user.email ;
        const user = await db.query(
            `SELECT *
             from users 
             where email = $1;`,
            [ user_email ]
        );
        const user_id = user.rows[0].user_id;
        const song_id = req.body.song_id;

        const song = await db.query(
            `SELECT *
             from songs 
             where song_id = $1;`,
            [ song_id ]
        );

        if (song.rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Song Doesn't Exists!",
            });
        }
        const favSong = await db.query(
            `SELECT *
             from fav_songs 
             where user_id = $1 and song_id = $2;`,
            [ user_id,song_id ]
        );
        if (favSong.rows.length !== 0) {
            return res.status(400).json({
                success: false,
                msg: "Song Is Already Favourite!",
            });
        }         
        await db.query(
            `INSERT INTO fav_songs values ($1, $2);`,
            [user_id, song_id]
        );
        return res.status(200).json({
            success: true,
            msg: "Added To Favourite!",
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

exports.removeFromFav = async(req,res) => {
    try {
        const user_email = req.user.email ;
        const user = await db.query(
            `SELECT *
             from users 
             where email = $1;`,
            [ user_email ]
        );
        const user_id = user.rows[0].user_id;
        const song_id = req.body.song_id;

        const song = await db.query(
            `SELECT *
             from songs 
             where song_id = $1;`,
            [ song_id ]
        );

        if (song.rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Song Doesn't Exists!",
            });
        }
        const favSong = await db.query(
            `SELECT *
             from fav_songs 
             where user_id = $1 and song_id = $2;`,
            [ user_id,song_id ]
        );
        if (favSong.rows.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Song Is Not Favourite!",
            });
        }         
        await db.query(
            `Delete from fav_songs where user_id = $1 and song_id = $2;`,
            [ user_id,song_id ]
        );
        return res.status(200).json({
            success: true,
            msg: "Remove From Favourite!",
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