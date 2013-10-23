var express = require('express');
var http = require('http');
var Team = require('./Team');

var app = express();
app.use(express["static"](__dirname+"/../web"));
app.get('/', function(req,res) {
	res.sendfile(require.resolve(__dirname+'/../web/index.html'));
});

var httpServer = http.createServer(app)
var io = require('socket.io').listen(httpServer);
httpServer.listen(5556);

io.configure(function () {
	io.set("log level", 2);
});

io.sockets.on('connection', onConnect);

var nextTeamAssignment = 0;
var teams = [new Team("red"), new Team("blue")];

teams.forEach(function (team) {
	team.on('player-died', function() {
		console.log('player from team '+team.name+' was killed, team now has '+team.livePlayers()+' left');

		var liveCount = teams.slice().sort(function(a, b) {return a.livePlayers()- b.livePlayers();});

		if (liveCount[0].livePlayers() < 1) {
			console.log("Teams: "+liveCount.map(function(t) {return t.name+" ("+t.livePlayers()+")";}).join("\t"));
			console.log(liveCount[0].name+" lost " + liveCount[liveCount.length - 1].name + " won");

			teams.forEach(function(t) {
				t.reset(liveCount[liveCount.length - 1].name);
			});
		}
	});
});

function onConnect(socket) {
	console.log('client ' + socket.id + ' connecting');
	teams[nextTeamAssignment].add(socket);
	nextTeamAssignment = (nextTeamAssignment + 1) % teams.length;
}

