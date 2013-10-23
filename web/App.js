$(document).ready(function(){
    //initialize socket.io
    App.init();
});

var boing = new Audio("/boing_x.mp3");
boing.load();

var end = new Audio('/end.ogg');
end.load();

var App = (function() {

    var socket = null;
    var previousY = null;
    var previousZ = null;
    var status = "running";

    return {
        init: function () {
            socket = io.connect();
            socket.on('join', this.join);
            socket.on('reset', this.reset);

            window.ondevicemotion =  function(event) {
                App.shake(status, event.acceleration.x, event.acceleration.y, event.acceleration.z);
            };
        },

        join: function(data) {
            status = "running";
            console.log(data);
            $("#messageBox").text("Your in team "+data.team+".");
            $("body").removeClass().addClass(data.team);

            window.setTimeout(function(){
                if(!$("body").hasClass("final")){
                    $("#messageBox").hide("fast");
                }
            }, 1000*2);

        },

        shake: function(status, accelerationX, accelerationY, accelerationZ){
	        var magnitude = Math.sqrt(accelerationX*accelerationX + accelerationY*accelerationY + accelerationZ*accelerationZ);

	        if (magnitude > 2 && magnitude < 4) {
		        // warn
		        if (boing.currentTime === 0 || boing.currentTime == boing.duration && (end.currentTime === 0 || end.currentTime === end.duration)) {
			        boing.play();
			        document.getElementById('msg').innerHTML = 'sound triggered';
		        }
	        } else if (magnitude >= 4) {
		        // die!
		        if (end.currentTime === 0 || end.currentTime == end.duration) {
			        end.play();
		        }
		        this.dead();
	        }
        },

        dead: function() {
            $("#messageBox").text('You\'re dead!').show();
            $("body").removeClass().addClass('final');
            socket.emit('dead');
        },

        reset: function(data){
            console.log(data);
            $("#messageBox").text('Winner: '+data.winner).show();
            $("body").removeClass().addClass('final');
            status = "stopped";

            window.setTimeout(function(){
                location.reload();
            }, 1000*10);
        }
    }
})();