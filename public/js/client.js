var Client = (function(window) {

  var socket      = null;
  var gameState   = null;

  var gameID      = null;
  var playerColor = null;
  var playerName  = null;

  var container   = null;
  var board       = null;
  var squares     = null;
  var squareIDs   = null;

  var selection = null;


  /* Initialize the UI */
  var init = function(config) {
    gameID      = config.gameID;
    playerColor = config.playerColor;
    playerName  = config.playerName;

    container   = $('#game');
    board       = $('#chess-board');
    squares     = board.find('td');

    squareIDs   = [
      'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
      'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
      'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
      'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
      'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
      'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
      'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
      'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
    ]

    socket = io.connect('http://localhost');

    if (playerColor === 'black') { squareIDs.reverse(); }
    squares.each(function(i) { $(this).attr('id', squareIDs[i]); });

    attachEventHandlers();

    socket.emit('join', gameID);
  };

  /* Attach both HTML and Socket event handlers */
  var attachEventHandlers = function() {
    if (playerColor === 'white') {
      container.on('click', '.white.pawn', function(ev) {
        if (gameState.activePlayer === 'white') { highlight(ev.target, 'wP'); }
      });
      container.on('click', '.white.rook', function(ev) {
        if (gameState.activePlayer === 'white') { highlight(ev.target, 'wR'); }
      });
      container.on('click', '.white.knight', function(ev) {
        if (gameState.activePlayer === 'white') { highlight(ev.target, 'wN'); }
      });
      container.on('click', '.white.bishop', function(ev) {
        if (gameState.activePlayer === 'white') { highlight(ev.target, 'wB'); }
      });
      container.on('click', '.white.queen', function(ev) {
        if (gameState.activePlayer === 'white') { highlight(ev.target, 'wQ'); }
      });
      container.on('click', '.white.king', function(ev) {
        if (gameState.activePlayer === 'white') { highlight(ev.target, 'wK'); }
      });
    }

    if (playerColor === 'black') {
      container.on('click', '.black.pawn',   function(ev) {
        if (gameState.activePlayer === 'black') { highlight(ev.target, 'bP'); }
      });
      container.on('click', '.black.rook',   function(ev) {
        if (gameState.activePlayer === 'black') { highlight(ev.target, 'bR'); }
      });
      container.on('click', '.black.knight', function(ev) {
        if (gameState.activePlayer === 'black') { highlight(ev.target, 'bN'); }
      });
      container.on('click', '.black.bishop', function(ev) {
        if (gameState.activePlayer === 'black') { highlight(ev.target, 'bB'); }
      });
      container.on('click', '.black.queen',  function(ev) {
        if (gameState.activePlayer === 'black') { highlight(ev.target, 'bQ'); }
      });
      container.on('click', '.black.king',   function(ev) {
        if (gameState.activePlayer === 'black') { highlight(ev.target, 'bK'); }
      });
    }

    // Clear "possible moves" highlights
    container.on('click', '.empty', function(ev) {
      clearHighlights();
    });

    // Move
    container.on('click', '.valid-move', function(ev) {
      var m = move(ev.target);
      socket.emit('move', {gameID: gameID, move: m});
    });

    // Capture
    container.on('click', '.valid-capture', function(ev) {
      var m = capture(ev.target);
      socket.emit('move', {gameID: gameID, move: m});
    });

    // Receive updated game data
    socket.on('update', function(data) {
      console.log(data);
      gameState = data;
      updateBoard();
    });
  };

  /* Highlight valid moves for selected piece */
  var highlight = function(squareElement, piece) {
    var square = $(squareElement);

    selection = {
      color: piece[0],
      piece: piece[1],
      file:  square.attr('id')[0],
      rank:  square.attr('id')[1]
    };

    // Highlight the current square
    squares.removeClass('selected');
    square.addClass('selected');

    // Highlight any valid moves
    squares.removeClass('valid-move valid-capture');
    for (var key in gameState.validMoves.moves) {
      if (key === piece+square.attr('id')) {
        for (var i=0; i<gameState.validMoves.moves[key].length; i++) {
          $('#'+gameState.validMoves.moves[key][i]).addClass('valid-move');
        };
      }
    }
    for (var key in gameState.validMoves.captures) {
      if (key === piece+square.attr('id')) {
        for (var i=0; i<gameState.validMoves.captures[key].length; i++) {
          $('#'+gameState.validMoves.captures[key][i]).addClass('valid-capture');
        };
      }
    }
  };

  /* Clear valid move highlights */
  var clearHighlights = function() {
    squares.removeClass('selected');
    squares.removeClass('valid-move');
    squares.removeClass('valid-capture');
  };

  /* Move piece in UI and send 'move' event to server */
  var move = function(squareElement) {
      var square       = $(squareElement);
      var pieceClasses = getPieceClasses(selection.color+selection.piece);

      // clear src
      $('#'+selection.file+selection.rank).removeClass(pieceClasses).addClass('empty');
      // populate dest
      square.removeClass('empty').addClass(pieceClasses);

      clearHighlights();

      return selection.color+selection.piece+selection.file+selection.rank+'-'+square.attr('id');
  };

  /* Move piece in UI and send 'move' event to server */
  var capture = function(squareElement) {
    var square       = $(squareElement);
    var pieceClasses = getPieceClasses(selection.color+selection.piece);

    $('#'+selection.file+selection.rank).removeClass(pieceClasses).addClass('empty');
    square.removeClass().addClass(pieceClasses);

    clearHighlights();
    return selection.color+selection.piece+selection.file+selection.rank+'x'+square.attr('id');
  };

  /* Update UI from gameState */
  var updateBoard = function() {
    for (var sq in gameState.board) {
      $('#'+sq).removeClass().addClass(getPieceClasses(gameState.board[sq]));
    }
  };

  /* Get appropriate CSS classes for piece */
  var getPieceClasses = function(piece) {
    switch (piece) {
      case 'bP'  : return 'black pawn';
      case 'bP_' : return 'black pawn not-moved';
      case 'bR'  : return 'black rook';
      case 'bR_' : return 'black rook not-moved';
      case 'bN'  : return 'black knight';
      case 'bN_' : return 'black knight not-moved';
      case 'bB'  : return 'black bishop';
      case 'bB_' : return 'black bishop not-moved';
      case 'bQ'  : return 'black queen';
      case 'bQ_' : return 'black queen not-moved';
      case 'bK'  : return 'black king';
      case 'bK_' : return 'black king not-moved';
      case 'wP'  : return 'white pawn';
      case 'wP_' : return 'white pawn not-moved';
      case 'wR'  : return 'white rook';
      case 'wR_' : return 'white rook not-moved';
      case 'wN'  : return 'white knight';
      case 'wN_' : return 'white knight not-moved';
      case 'wB'  : return 'white bishop';
      case 'wB_' : return 'white bishop not-moved';
      case 'wQ'  : return 'white queen';
      case 'wQ_' : return 'white queen not-moved';
      case 'wK'  : return 'white king';
      case 'wK_' : return 'white king not-moved';
      default    : return 'empty';
    }
  };

  return init;

}(window));