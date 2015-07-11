var static = require('node-static');
var http = require('http');
var file = new (static.Server)();
var app = http.createServer(function (req, res) {
    file.serve(req, res);
}).listen(2013);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
    function log() {
        var array = [">>> Message from server: "];
        for (var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        socket.emit('log', array);
    }

    socket.on('message', function (message) {
        log('Got message:', message);
        socket.broadcast.emit('message', message);
    });

    socket.on('create or join', function (roomName) {
        //var numClients = io.sockets.clients(room).length;
        //var room = io.nsps['/'].adapter.rooms[roomName];
        var room = io.sockets.adapter.rooms[roomName];
        var numClients = 0;
        if(room)
            numClients = Object.keys(room).length;

        log('Room ' + roomName + ' has ' + numClients + ' client(s)');
        log('Request to create or join room ' + roomName);

        if (numClients === 0) {
            socket.join(roomName);
            socket.emit('created', roomName);
        } else if (numClients === 1) {
            io.sockets.in(roomName).emit('join', roomName);
            socket.join(roomName);
            socket.emit('joined', roomName);
        } else { // max two clients per room
            socket.emit('full', roomName);
        }
        socket.emit('emit(): client ' + socket.id + ' joined room ' + roomName);
        socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + roomName);

    });
});
