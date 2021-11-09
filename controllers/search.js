const db = require("../config/db");

exports.getSongs = async (req,res) => {
	if(req.query.title){
		const search = '%' + req.query.title + '%';
		try {
			const { rows } = await db.query(
	            `SELECT songs.song_id,artist.name as artist ,title,year,album.name as album
	             from songs,artist,album where songs.album_id = album.album_id 
	             and album.artist_id = artist.artist_id and LOWER(title) LIKE LOWER($1);`,
	             [search]
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
	else{
		try {
			const { rows } = await db.query(
	            `SELECT songs.song_id,artist.name as artist ,title,year,album.name as album
	             from songs,artist,album where songs.album_id = album.album_id 
	             and album.artist_id = artist.artist_id;`
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
}

exports.getGroups = async (req,res) => {
	if(req.query.name){
		const search = '%' + req.query.name + '%';
		try {
			const { rows } = await db.query(
	            `SELECT group_id, name, artist
	             from group_name
	             where type = 'group' and LOWER(artist) LIKE LOWER($1);`,
	             [search]
	        );
	        return res.status(200).json({
	            success: true,
	            msg: "Group Fetch Successfully!",
	            groupsList : rows,
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
	else{
		try {
			const { rows } = await db.query(
	            `SELECT group_id ,name, artist
	             from group_name where type = 'group';`,
	        );
	        return res.status(200).json({
	            success: true,
	            msg: "Group Fetch Successfully!",
	            groupsList : rows,
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
}

exports.getUsers = async (req,res) => {
	if(req.query.name){
		const search = '%' + req.query.name + '%';
		try {
			const { rows } = await db.query(
	            `SELECT name, dob, email, address 
	             from users 
	             where LOWER(name) LIKE LOWER($1);`,
	             [search]
	        );
	        return res.status(200).json({
	            success: true,
	            msg: "Users Fetch Successfully!",
	            usersList : rows,
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
	else{
		try {
			const { rows } = await db.query(
	            `SELECT name, dob, email, address 
	             from users;`,
	        );
	        return res.status(200).json({
	            success: true,
	            msg: "User Fetch Successfully!",
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
}