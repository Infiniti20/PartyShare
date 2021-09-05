const crypto = require('crypto');
const fs = require("fs")



export default {
	computeHash: function (text: string):string {
		const hash = crypto.createHash('sha256').update(text).digest('base64');
		return hash
	},
	generateUID: function (pattern?: string):string {
		return 'xxxxxxxx-xxxx-4xxxx-xxx-x'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	},
	filter: function (req: any, file: any, cb: any) {
		// Accept images only
		if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|jfif|JFIF|webm|WEBM)$/)) {
			req.fileValidationError = 'Only image files are allowed';
			return cb(new Error('Only image files are allowed'), false);
		}
		cb(null, true);
	},
	getExt: function (filename:string):string {
		var i = filename.lastIndexOf('.');
		return (i < 0) ? '' : filename.substr(i);
	},
	replaceValues: function (str:string, values: any):string {
		var str = str.replace(/\[\w*\]/g, function (match, val) {
			return values[match.slice(1, -1)] || match;
		});
		return str
	},
	getFileStream: async function (path: string){
		let reader = fs.createReadStream(path);

		let promise = new Promise(function (resolve, reject) {
			reader.on('data', (chunk: Buffer) => resolve(chunk.toString()));
			reader.on('error', reject); 
		});

		let data = await promise;
		return data
	}

}
