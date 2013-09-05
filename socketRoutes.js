/**
 * Attach route/event handlers for socket.io
 */
exports.attach = function(io, DB) {

  // New socket connection made
  io.sockets.on('connection', function (socket) {
    console.log('Socket '+socket.id+' connected');

    var sess = socket.handshake.session;

    // Join game
    socket.on('join', function(gameID) {
      if (gameID !== sess.gameID) {
        console.log('ERROR: Game ID mismatch');
        return;
      }

      var game = DB.find(gameID);
      if (game.addPlayer(sess)) {
        console.log(sess.playerName+ ' joined '+gameID);
        socket.join(gameID);
        io.sockets.in(gameID).emit('update', game);
      } else {
        console.log(sess.playerName+' failed to join '+gameID);
      }
    });

    // Make a move
    socket.on('move', function(data) {
      if (data.gameID !== sess.gameID) {
        console.log('ERROR: Game ID mismatch');
        return;
      }

      var game = DB.find(data.gameID);
      if (game.move(data.move)) {
        console.log(sess.playerName+': '+data.move);
        io.sockets.in(data.gameID).emit('update', game)
      } else {
        console.log(sess.playerName+': '+data.move+' Failed');
      }
    })

    // Socket connection lost
    socket.on('disconnect', function() {
      var game = DB.find(sess.gameID);
      if (game.removePlayer(sess)) {
        console.log(sess.playerName+' left '+sess.gameID);
        console.log('Socket '+socket.id+' disconnected');
      }
    });
  });
};