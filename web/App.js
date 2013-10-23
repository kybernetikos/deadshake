$(document).ready(function(){
    //initialize socket.io
    App.init();
});

var App = (function() {

    var socket = null;
    var previousY = null;
    var previousZ = null;
    var status = "running"

    return {
        init: function () {
            socket = io.connect('localhost');
            socket.on('join', this.join);
            socket.on('reset', this.reset);

            window.addEventListener("deviceorientation", function () {
                App.shake(status, event.alpha, event.beta, event.gamma);
            }, true);
        },

        join: function(data) {
            status = "running";
            console.log(data);
            $("#messageBox").hide();
            $("body").removeClass().addClass(data.team);
        },

        shake: function(status, currentX, currentY, currentZ){

            // Don't die on start
            if(previousY && previousZ && status == "running"){

                var fuzzy  = 0.80;

                // Checker
                if((previousY - currentY) > fuzzy){
                    console.log("DEAD Y", previousY, currentY);
                    this.dead();
                }

                // Checker
                if((previousZ - currentZ) > fuzzy){
                    console.log("DEAD Z", previousZ, currentZ);
                    this.dead();
                }
            }

            previousY = currentY;
            previousZ = currentZ;
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
            status = "stopped"
        }
    }
})();