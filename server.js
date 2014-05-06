var express = require('express');
var _ = require('underscore');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var usernames = {};
server.listen(process.env.PORT || 3000);
//For Specific User
var userMapping = {
		'a':'b',
	};

var socketMapping = {
		
};
//For Specific User
app.set('view engine', 'ejs');
app.set('view options', { layout: false });
app.use(express.methodOverride());
app.use(express.bodyParser());  
app.use(app.router);
app.use('/public', express.static('public'));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/world', function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("<h2 style='color:green'>Hello World.</h2>");
	res.end()
});

io.sockets.on('connection', function(socket) {
	socket.on('sendchat', function (data) {
		var _name = data.id;
		var _usr = userMapping[_name];
		console.log("User--->"+_usr);
		var _sock = socketMapping[_usr];
		console.log('Socket-->'+_sock);
		io.sockets.socket(_sock).emit('updatechat', socket.username, data.msg);
	});

	socket.on('adduser', function(username) {
		socket.username = username;
		console.log("--->"+socket.id+"--->"+username);
		socketMapping[username] =  socket.id;
		usernames[username] = username;
		console.log("--->"+socketMapping[username]);
		socket.emit('servernotification', { connected: true, to_self: true, username: username });

		socket.broadcast.emit('servernotification', { connected: true, username: username });

		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){

		delete usernames[socket.username];

		io.sockets.emit('updateusers', usernames);

		socket.broadcast.emit('servernotification', { username: socket.username });
	});
});
