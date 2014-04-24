var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var log = require('winston');
var app = express();
var server = app;

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
    log.info('Express server listening on port ' + app.get('port'));
});
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({port: 9000, path: '/myapp'});
