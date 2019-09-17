var fs = require('fs');

module.exports.getVideos = async (req, res, next) => {
	var files = await fs.readdirSync(__dirname);
	// console.log("files", files);
	files = await this.getVideosFromDirectory();
	res.send(files);

	
};

module.exports.getVideosFromDirectory = () => {
	return new Promise((resolve, reject) => {
		try {
			let dir = "./data/activeVideoes";
			let path = `${process.env.EXPRESS_SCHEME}${process.env.EXPRESS_HOST}:${process.env.EXPRESS_PORT}/data/activeVideoes/`;
			var contents = fs.readdirSync(dir);
			let files = [];
			let counter = -1;

			var getFiles = () => {
				counter++;
				if (contents[counter]) {
					let fileName = contents[counter];
					var stat = fs.statSync(dir + '/' + fileName);
					// console.log('stat', fileName, stat.size);
					if (stat && stat.isFile()) {
						let file = path + fileName;
						let size = stat.size;
						files.push({ file, size, fileName });
					}
					getFiles();
				}
			};
			getFiles();
			resolve({ error: false, data: files });
			return;
		} catch (_catch) {
			// console.log("getVideosFromDirectory -> _catch", _catch);
			resolve({ error: true, data: _catch, message: _catch.message });
			return;
		}
	});
};