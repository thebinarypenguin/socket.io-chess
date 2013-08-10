(function(window) {

  // Create our global Client container
  window.Client = {};

  // Add an initialize function
  window.Client.init = function(config) {
    var gameID      = config.gameID;
    var playerColor = config.playerColor;
    var playerName  = config.playerName;

    this.gameState = {};

    var socket = io.connect('http://localhost');

    var container = $('#game');
    var allSquares = $('#chess-board').find('td');
    var ids = [
      'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
      'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
      'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
      'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
      'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
      'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
      'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
      'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
    ];

    if (playerColor === 'white') {
      // Add ids to table cells
      allSquares.each(function(i) { $(this).attr('id', ids[i]) });

      // Attach click handlers for white pieces
      container.on('click', '.white.pawn', function(ev) {
        if (window.Client.gameState.activePlayer === 'white') {
          window.Client.UI.highlight(ev.target, 'wP');
        }
      });
      container.on('click', '.white.rook', function(ev) {
        if (window.Client.gameState.activePlayer === 'white') {
          window.Client.UI.highlight(ev.target, 'wR');
        }
      });
      container.on('click', '.white.knight', function(ev) {
        if (window.Client.gameState.activePlayer === 'white') {
          window.Client.UI.highlight(ev.target, 'wN');
        }
      });
      container.on('click', '.white.bishop', function(ev) {
        if (window.Client.gameState.activePlayer === 'white') {
          window.Client.UI.highlight(ev.target, 'wB');
        }
      });
      container.on('click', '.white.queen', function(ev) {
        if (window.Client.gameState.activePlayer === 'white') {
          window.Client.UI.highlight(ev.target, 'wQ');
        }
      });
      container.on('click', '.white.king', function(ev) {
        if (window.Client.gameState.activePlayer === 'white') {
          window.Client.UI.highlight(ev.target, 'wK');
        }
      });
    }

    if (playerColor === 'black') {
      // Add ids to table cells
      ids.reverse();
      allSquares.each(function(i) { $(this).attr('id', ids[i]) });

      // Attach click handlers for black pieces
      container.on('click', '.black.pawn',   function(ev) {
        if (window.Client.gameState.activePlayer === 'black') {
          window.Client.UI.highlight(ev.target, 'bP');
        }
      });
      container.on('click', '.black.rook',   function(ev) {
        if (window.Client.gameState.activePlayer === 'black') {
          window.Client.UI.highlight(ev.target, 'bR');
        }
      });
      container.on('click', '.black.knight', function(ev) {
        if (window.Client.gameState.activePlayer === 'black') {
          window.Client.UI.highlight(ev.target, 'bN');
        }
      });
      container.on('click', '.black.bishop', function(ev) {
        if (window.Client.gameState.activePlayer === 'black') {
          window.Client.UI.highlight(ev.target, 'bB');
        }
      });
      container.on('click', '.black.queen',  function(ev) {
        if (window.Client.gameState.activePlayer === 'black') {
          window.Client.UI.highlight(ev.target, 'bQ');
        }
      });
      container.on('click', '.black.king',   function(ev) {
        if (window.Client.gameState.activePlayer === 'black') {
          window.Client.UI.highlight(ev.target, 'bK');
        }
      });
    }

    // Clear "possible moves" highlights
    container.on('click', '.empty', function(ev) {
      window.Client.UI.clearHighlight();
    });

    // Move
    container.on('click', '.valid-move', function(ev) {
      var move = window.Client.UI.move(ev.target);
      socket.emit('move', {gameID: gameID, move: move});
    });

    // Capture
    container.on('click', '.valid-capture', function(ev) {
      var move = window.Client.UI.capture(ev.target);
      socket.emit('move', {gameID: gameID, move: move});
    });

    // Receive updated game data
    socket.on('update', function(data) {
      console.log(data);
      window.Client.gameState = data;
      window.Client.UI.updateBoard(data.board);
    });

    // Join the game
    socket.emit('join', config.gameID);
  };

}(window));