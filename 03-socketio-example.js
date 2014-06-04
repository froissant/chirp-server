// Socket.IO Example
// -----------------

var socketio = require('socket.io'),
    io = socketio.listen(7000);

// Listen for the `connection` event for incoming sockets.
io.sockets.on('connection', function (socket) {

    // Print the socket ID on connection
    console.log('Socket ' + socket.id + ' connected.');

    // The server will invoke the callback when a client
    // emits the event `other-event`.
    socket.on('client-message', function (data) {
        console.log(data);
        socket.emit('server-message', {msg: 'Message "' + data.msg + '" received.'});
    });

    // Execute the callback if the client disconnects.
    socket.on('disconnect', function() {
        console.log('client disconnected.');
    });
});