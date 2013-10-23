var Team = require('./Team');

function Room(roomId) {
	this.id = roomId;
	var teams = [new Team("red"), new Team("blue")];
	var nextTeamAssignment = 0;

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

	this.addPlayer = function(player) {
		teams[nextTeamAssignment].add(player);
		nextTeamAssignment = (nextTeamAssignment + 1) % teams.length;
	};
}

module.exports = Room;