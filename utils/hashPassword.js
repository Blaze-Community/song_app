const bcrypt = require("bcrypt");

exports.hashPassword = async (password) => {
    return await new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
};

exports.comparePassword = async (param1, param2) => {
    return await new Promise((resolve, reject) => {
        bcrypt.compare(param1, param2, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}
