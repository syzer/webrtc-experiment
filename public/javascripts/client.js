(function () {
    var socket = new WebSocket("ws://" + location.host + "/connect");
    socket.onopen = function () {

    };
    socket.onmessage = function (e) {
        var message = JSON.parse(e.data);
        switch (message.type) {
            case "user-connected":

                break;
            case "user-disconnected":

                break;
        }
    };
})();

