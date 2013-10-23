var EventEmitter = require( "events" ).EventEmitter;

var players = [];

function Team(name) {
	EventEmitter.call(this);
	this.players = [];
	this.name = name;
	this.deadPlayers = [];
}

Team.prototype = Object.create(EventEmitter.prototype);

Team.prototype.livePlayers = function() {
	return this.players.length - this.deadPlayers.length;
};

Team.prototype.add = function(playerSocket) {
	console.log('client '+playerSocket.id+' assigned to team '+this.name+' which has '+this.players.length+' other players');
	this.players.push(playerSocket);
	playerSocket.on('disconnect', function() {
		console.log('client '+playerSocket.id+' disconnecting');
		var index = this.players.indexOf(playerSocket);
		if (index >= 0) {
			this.players.splice(index, 1);
			console.log('client '+playerSocket.id+' removed from team '+this.name);
		}
		this.emit('player-died');
	}.bind(this));

	playerSocket.on('dead', function() {
		if (this.deadPlayers.indexOf(playerSocket) < 0) {
			this.deadPlayers.push(playerSocket);
			this.emit('player-died');
		} else {
			console.log('got a dead message for '+playerSocket.id+' but, that player was already dead');
		}
	}.bind(this));

	playerSocket.emit('join', {
		team: this.name
	});
};
Team.prototype.size = function() {
	return this.players.length;
};

Team.prototype.reset = function(winner) {
	this.deadPlayers = [];
	this.players.forEach(function(socket) {
		socket.emit('reset', {
			winner: winner
		});
	});
};

module.exports = Team;