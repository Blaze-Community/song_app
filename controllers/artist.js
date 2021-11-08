const db = require("../config/db");


exports.artistDetail = async(req,res) => {
    try {
        const artist_id = req.params.id;

        const { rows } = await db.query(
            `SELECT artist_id, name
             from artist where artist_id = $1;`,
             [ artist_id ]
        );
        return res.status(200).json({
            success: true,
            msg: "Artist Fetch Successfully!",
            artist: rows[0],
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

exports.allSongs = async(req,res) => {
    try {
        const artist_id = req.params.id;
        const { rows } = await db.query(
            `SELECT songs.song_id,artist.name as artist ,title,year,album.name as album
             from songs,artist,album where songs.album_id = album.album_id 
             and album.artist_id = artist.artist_id and artist.artist_id = $1;`,
             [ artist_id ]
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

exports.allArtists = async(req,res) => {
    try {
        const { rows } = await db.query(
            `SELECT artist_id, name
             from artist;`
        );
        return res.status(200).json({
            success: true,
            msg: "Artists Fetch Successfully!",
            artistsList : rows,
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