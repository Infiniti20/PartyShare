const crypto = require('crypto');
const fs = require("fs")

module.exports = {
	computeHash: function (text) {
		const hash = crypto.createHash('sha256').update(text).digest('base64');
		return hash
	},
	generateUUID: function () {
		return 'xxxxxxxx-xxxx-4xxxx-xxx-x'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	},
	filter: function (req, file, cb) {
		// Accept images only
		if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
			req.fileValidationError = 'Only image files are allowed';
			return cb(new Error('Only image files are allowed'), false);
		}
		cb(null, true);
	},
	getExt: function (filename) {
		var i = filename.lastIndexOf('.');
		return (i < 0) ? '' : filename.substr(i);
	},
	getClosest: function (goal, counts) {
		Math.min(...counts.filter(num => num >= goal));
	},
	replaceValues: function (str, values) {
		var str = str.replace(/\[\w*\]/g, function (match, val) {
			return values[match.slice(1, -1)] || match;
		});
		return str
	},
	getFileStream: async function (path) {
		let reader = fs.createReadStream(path);

		let promise = new Promise(function (resolve, reject) {
			reader.on('data', (chunk) => resolve(chunk.toString()));
			reader.on('error', reject); // or something like that. might need to close `hash`
		});

		let data = await promise;
		return data
	}

}