var express = require('express');
var http = require('http');
var Room = require('./Room');

var app = express();
var indexFile = require.resolve(__dirname+'/../web/index.html');
var roomFile =  require.resolve(__dirname+'/../web/room.html');

app.use(express["static"](__dirname+"/../web"));
app.get('/', function(req,res) {
	res.sendfile(indexFile);
});
app.use('/room', function(req,res) {
	res.sendfile(roomFile);
});

var httpServer = http.createServer(app)
var io = require('socket.io').listen(httpServer);
httpServer.listen(5556);

io.configure(function () {
	io.set("log level", 2);
});

io.sockets.on('connection', onConnect);

var rooms = {};

function onConnect(socket) {
	var referer = socket.handshake.headers.referer;
	var index = referer.indexOf('/room/');
	if (index >= 0) {
		var roomId = referer.substring(index + 6);
		console.log('client ' + socket.id + ' connecting to room '+roomId);
		var room = rooms[roomId] || (rooms[roomId] = new Room(roomId));
		room.addPlayer(socket);
	} else {
		console.log('incorrect connection');
	}
}