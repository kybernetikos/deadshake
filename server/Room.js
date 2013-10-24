var Team = require('./Team');

function Room(roomId) {
	this.id = roomId;
	var teams = [new Team("red"), new Team("blue")];

	function broadcastInfo(rankings) {
		rankings = rankings || teams.slice().sort(function(a, b) {return a.livePlayers()- b.livePlayers();});
		teams.forEach(function(team) {
			team.info(rankings);
		});
	}

	teams.forEach(function (team) {
		team.on('player-died', function() {
			console.log(roomId+': player from team '+team.name+' was killed, team now has '+team.livePlayers()+' left');
			var liveCount = teams.slice().sort(function(a, b) {return a.livePlayers()- b.livePlayers();});

			if (liveCount[0].livePlayers() < 1) {
				console.log(roomId+": Teams: "+liveCount.map(function(t) {return t.name+" ("+t.livePlayers()+")";}).join("\t"));
				console.log(roomId+": "+liveCount[0].name+" lost " + liveCount[liveCount.length - 1].name + " won");

				teams.forEach(function(t) {
					t.reset(liveCount[liveCount.length - 1].name);
				});
			} else {
				broadcastInfo(liveCount);
			}
		});
	});

	this.addPlayer = function(player) {
		teams.slice().sort(function(a, b) {return a.size() - b.size();})[0].add(player);
		broadcastInfo();
	};
}

module.exports = Room;