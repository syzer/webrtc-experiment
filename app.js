
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded());
//app.use(express.methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
var webRTC = require('webrtc.io').listen(server);
//then a bunch of callbacks are available
console.log('WebRTC server listening on port 8001');



webRTC.rtc.on('chat_msg', function(data, socket) {
    var roomList = webRTC.rtc.rooms[data.room] || [];

    for (var i = 0; i < roomList.length; i++) {
        var socketId = roomList[i];

        if (socketId !== socket.id) {
            var soc = webRTC.rtc.getSocket(socketId);

            if (soc) {
                soc.send(JSON.stringify({
                    "type": 3,
                    "eventName": "receive_chat_msg",
                    "data": {
                        "messages": data.messages,
                        "color": data.color
                    }
                }), function(error) {
                    if (error) {
                        console.log(error);
                    }
                });
            }
        }
    }
});

//app.get('/', function(req, res) {
//    res.sendfile(__dirname + '/index.html');
//});
//
//app.get('/style.css', function(req, res) {
//    res.sendfile(__dirname + '/style.css');
//});
//
//app.get('/fullscrean.png', function(req, res) {
//    res.sendfile(__dirname + '/fullscrean.png');
//});
//
//app.get('/script.js', function(req, res) {
//    res.sendfile(__dirname + '/script.js');
//});
//
//app.get('/webrtc.io.js', function(req, res) {
//    res.sendfile(__dirname + '/webrtc.io.js');
//});
