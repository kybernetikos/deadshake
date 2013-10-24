$(document).ready(function(){
	//initialize socket.io
	App.init();
});

var App = (function() {
	var socket = null;
	var status = "running";

	var warnLevel = 0.8;
	var dieLevel = 1.8;
	var rotWarn = 50;
	var rotDie = 100;

	var statusElement = document.getElementById('status');
	var shakinessElement = document.getElementById('shakiness');

	var Sound = {
		warn: new Audio('/effects/Greenhourglass_8-bit boing.ogg'),
		dead: new Audio('/effects/98874_robinhood76_01850_cartoon_dissapoint.ogg'),
		gameOver: new Audio('/effects/gameover.ogg')
	};

	for (var key in Sound) {
		Sound[key].load();
	}

	var previousSound = null;
	function playSound(soundName) {
		if (previousSound !== null) {
			previousSound.pause();
			previousSound.currentTime = 0;
		}
		var sound = Sound[soundName];
		if (sound.currentTime === 0 || sound.currentTime === sound.duration) {
			sound.currentTime = 0;
			sound.play();
		}
		previousSound = sound;
	}

	var lastMagnitude = null;
	var lastRotation = null;

	return {
		init: function () {
			socket = io.connect();
			socket.on('join', this.join.bind(this));
			socket.on('reset', this.reset.bind(this));
			socket.on('info', this.info.bind(this));

			window.addEventListener("devicemotion", function(event) {
				var acl = event.accelerationIncludingGravity;
				var compensation = 100;
				if (event.acceleration) {
					acl = event.acceleration;
					compensation = 0;
				}
				var accelerationX = acl.x;
				var accelerationY = acl.y;
				var accelerationZ = acl.z;
				var magnitude = Math.sqrt(accelerationX*accelerationX + accelerationY*accelerationY + accelerationZ*accelerationZ - compensation);

				var rotationMagnitude = 0;
				var rotationRate = event.rotationRate;
				if (rotationRate) {
					var rotA = rotationRate.alpha * rotationRate.alpha;
					var rotB = rotationRate.beta * rotationRate.beta;
					var rotG = rotationRate.gamma * rotationRate.gamma;
					rotationMagnitude = Math.sqrt(rotA + rotB + rotG);
				}
				if (lastMagnitude !==  null) {
					this.shake(Math.abs(magnitude - lastMagnitude), Math.abs(rotationMagnitude- lastRotation));
				}
				lastMagnitude = magnitude;
				lastRotation = rotationMagnitude;
			}.bind(this), false);
		},

		team: null,

		join: function(data) {
			status = "joining";
			this.team = data.team;
			$("#messageBox").text("Team "+this.team);

			$("body").removeClass().addClass(data.team);

			window.setTimeout(function(){
				 if(!$("body").hasClass("final")){
					  $("#messageBox").hide("fast");
				 }
				status = "running";
			}, 1000*2);
		},

		shake: function(shakiness, rotation) {
			shakinessElement.innerHTML = (Math.floor(shakiness*10000) / 10000)+" "+(Math.floor(rotation*10000) / 10000);
			if (status === "running") {
				if ((shakiness >= warnLevel || rotation >= rotWarn) && shakiness < dieLevel && rotation < rotDie) {
					this.warn();
				} else if (shakiness >= dieLevel || rotation >= rotDie) {
					this.dead();
				}
			}
		},

		warn: function() {
			if (status === 'running') {
				playSound("warn");
			}
		},

		dead: function() {
			status = "dead";
			playSound("dead");
			$("#messageBox").text("You're dead!").show();
			$("body").removeClass().addClass('final');
			socket.emit('dead');
		},

		info: function(data) {
			statusElement.innerHTML = data.rankings.map(function(info) {
				return info.name+"("+info.live+"/"+info.players+")";
			}).join(" ");
		},

		reset: function(data){
			playSound("gameOver");
			var weWon = false;
			if (data.winner === this.team) {
				weWon = true;
			}
			$("#messageBox").text("Your team " + (weWon ? "wins!" : "loses!")).show();
			$("body").removeClass().addClass('final');
			status = "stopped";

			setTimeout(function() {
				 App.join({team: this.team});
			}.bind(this), 1000*5);
		}
	}
})();