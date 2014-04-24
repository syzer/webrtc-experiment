(function () {
    var users = {};

    var socket = new WebSocket("ws://" + location.host + "/connect");
    socket.onopen = function () {

    };
    socket.onmessage = function (e) {
        var message = JSON.parse(e.data);
        switch (message.type) {
            case "user-connected":
                var username = message.username;
                var $user = $("li").text(username);
                users[message.user] = {name: username, $el: $user};
                $("ul.users").append($user);
                break;
            case "user-disconnected":
                var user = users[message.user];
                if (user) {
                    user.$el.remove();
                }
                break;
        }
    };

})();

