(function () {
    var ownPeerId = window.prompt("Username", localStorage.getItem("username") || "");
    localStorage.setItem("username", ownPeerId);

    var peer = window.peer = new Peer(ownPeerId, {host: 'localhost', port: 9000, path: '/chat'});
    peer.listAllPeers(function (users) {
        users.forEach(function (peerId) {
            addUser(peer.connect(peerId));
        });
    });
    peer.on('connection', function (conn) {
        addUser(conn);
    });

    function addUser(conn) {
        var $el = $("<li>").text(conn.peer).appendTo(".users");
        conn.on('data', function (data) {
            addMessage(conn.peer, data);
        });
        conn.on('close', function () {
            $el.remove();
        });
    }

    function addMessage(peerId, text) {
        if (text && text.length) {
            var $message = $("<p><span class='user'></span><span class='text'></span><time></time>");
            $message.find('.user').text(peerId);
            $message.find('.text').text(text);
            var now = new Date();
            var time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            $message.find('time').text(time);
            $message.appendTo(".log");
        }
    }

    $(function () {
        $("form").on("submit", function (e) {
            e.preventDefault();

            var $input = $("input");
            var message = $input.val();
            addMessage(peer.id, message);
            $input.val("");

            for (var id in peer.connections) {
                peer.connections[id][0].send(message);
            }
        });
    });

})();

