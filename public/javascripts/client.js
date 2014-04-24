(function () {
    var ownPeerId = window.prompt("Username");

    var users = {};

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
        var $el = $("<li>").text(conn.peer).appendTo("ul.users");
        conn.on('close', function () { // TODO not called?
            $el.remove();
        });
    }

})();

