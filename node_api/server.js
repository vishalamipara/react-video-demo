var express = require('express'),
	bodyParser = require('body-parser'),
	cors = require('cors');
let VideoRoute = require('./routes/VideoRoute');
let VideoController = require('./controllers/VideoController');
var freshVideos = [];
var videoFileNames = [];
var sockets = [];
const app = express();
var port = process.env.EXPRESS_PORT;
app.use((req, res, next) => {
	var _send = res.send;
	var sent = false;
	res.send = (data) => {
		if (sent) return;
		_send.bind(res)(data);
		sent = true;
	};
	next();
});

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

const server = app.listen(port, /*ip,*/() => {
	console.log('Listening on port ' + port);
	console.log(new Date().toString());
	console.log(`SERVER STARTED...`);

	app.use('/api/videos', VideoRoute);
	app.use(express.static(__dirname));
});

//	socket	
var http = require('http').Server(app);
var io = require('socket.io')(http);
var chokidar = require('chokidar');
let dir = "./data/activeVideoes";
let path = `${process.env.EXPRESS_SCHEME}${process.env.EXPRESS_HOST}:${process.env.EXPRESS_PORT}/data/activeVideoes/`;
io.on('connection', (socket) => {
	console.log(`connected ${socket.id}`);
	sockets.push(socket.id);
	socket.on('disconnect', () => {
		console.log(`disconnected ${socket.id}`);
		if (sockets.indexOf(socket.id) > -1) {
			sockets.splice(sockets.indexOf(socket.id), 1);
		}
	});



	socket.on('videos', async () => {
		let files = await VideoController.getVideosFromDirectory();
		if (!files.error) {
			socket.emit('videos', { videos: files.data });
		}
	});
	// fileWatcher();
});

var fileWatcher = () => {
	var watcher = chokidar.watch(dir, {});
	let getFileName = (file) => {
		return file ? file.substring(file.lastIndexOf('/') + 1) : null;
	};

	watcher
		.on('add', function (temp) {
			let file = getFileName(temp);
			if (file) {
				file = path + file;
				if (videoFileNames.indexOf(temp) == -1) {
					freshVideos.push({ file, name: `Video${Math.random()}` });
					videoFileNames.push(temp);
					// io.in(sockets).emit('videos', { videos: freshVideos });
					io.sockets.emit('videos', { videos: freshVideos });
					// console.log("add", freshVideos);
				}
			}
		})
		.on('unlink', function (temp) {
			let file = getFileName(temp);
			if (file) {
				file = dir + file;
				if (videoFileNames.indexOf(temp) > -1) {
					freshVideos.splice(videoFileNames.indexOf(temp), 1);
					videoFileNames.splice(videoFileNames.indexOf(temp), 1);
					// io.in(sockets).emit('videos', { videos: freshVideos });
					io.sockets.emit('videos', { videos: freshVideos });
					// console.log("unlink", freshVideos);
				}
			}
		});
};

fileWatcher();

http.listen(process.env.SOCKET_PORT, () => {
	console.log(`socket listening on :${process.env.SOCKET_PORT}`);
});