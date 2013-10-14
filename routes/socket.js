/**
 * Attach route/event handlers for socket.io
 */
exports.attach = function(io, DB) {

  // New socket connection made
  io.sockets.on('connection', function (socket) {
    console.log('Socket '+socket.id+' connected');

    var sess = socket.handshake.session;

    /*
     * Join game
     */
    socket.on('join', function(gameID) {

      var debugInfo = {
        socketID : socket.id,
        event    : 'join',
        gameID   : gameID,
        session  : sess
      };

      // Check for permission
      if (gameID !== sess.gameID) {
        console.log('ERROR: Access Denied', debugInfo);
        socket.emit('error', {message: "You cannot join this game"});
        return;
      }

      // Look for game
      var game = DB.find(gameID);
      if (!game) {
        console.log('ERROR: Game Not Found', debugInfo);
        socket.emit('error', {message: "Game not found"});
        return;
      }

      // Add player to game
      var result = game.addPlayer(sess);
      if (!result) {
        console.log('ERROR: Failed to Add Player', debugInfo);
        socket.emit('error', {message: "Unable to join game"});
        return;
      }

      // Add player to a socket.io "room" that matches the game ID
      socket.join(gameID);

      console.log(sess.playerName+' joined '+gameID);
      io.sockets.in(gameID).emit('update', game);
    });

    /*
     * Make a move
     */
    socket.on('move', function(data) {

      var debugInfo = {
        socketID : socket.id,
        event    : 'move',
        gameID   : data.gameID,
        move     : data.move,
        session  : sess
      };

      // Check for permission
      if (data.gameID !== sess.gameID) {
        console.log('ERROR: Access Denied', debugInfo);
        socket.emit('error', {message: "You have not joined this game"});
        return;
      }

      // Look for game
      var game = DB.find(data.gameID);
      if (!game) {
        console.log('ERROR: Game Not Found', debugInfo);
        socket.emit('error', {message: "Game not found"});
        return;
      }

      // Apply move to game
      var result = game.move(data.move);
      if (!result) {
        console.log('ERROR: Failed to Apply Move', debugInfo);
        socket.emit('error', {message: "Invalid move, please try again"});
        return;
      }

      console.log(data.gameID+' '+sess.playerName+': '+data.move);
      io.sockets.in(data.gameID).emit('update', game);
    })

    /*
     * Socket connection lost
     */
    socket.on('disconnect', function() {

      var debugInfo = {
        socketID : socket.id,
        event    : 'disconnect',
        session  : sess
      };

      // Look for game
      var game = DB.find(sess.gameID);
      if (!game) {
        console.log('ERROR: Game Not Found', debugInfo);
        return;
      }

      // Remove player from game
      var result = game.removePlayer(sess);
      if (!result) {
        console.log('ERROR: '+sess.playerName+' failed to leave '+sess.gameID);
        return;
      }

      console.log(sess.playerName+' left '+sess.gameID);
      console.log('Socket '+socket.id+' disconnected');
    });
  });
};