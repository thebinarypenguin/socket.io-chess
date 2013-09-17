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


    if (playerColor === 'black') { squareIDs.reverse(); }
    squares.each(function(i) { $(this).attr('id', squareIDs[i]); });

    attachDOMEventHandlers();

    socket = io.connect();

    socket.on('update', function(data) {
      console.log(data);
      gameState = data;
      updateBoard();
    });

    socket.emit('join', gameID);
  };

  /* Attach both HTML and Socket event handlers */
  var attachDOMEventHandlers = function() {
    if (playerColor === 'white') {
      container.on('click', '.white.pawn', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === 'white') { highlight(ev.target, 'wP'); }
      });
      container.on('click', '.white.rook', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === 'white') { highlight(ev.target, 'wR'); }
      });
      container.on('click', '.white.knight', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === 'white') { highlight(ev.target, 'wN'); }
      });
      container.on('click', '.white.bishop', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === 'white') { highlight(ev.target, 'wB'); }
      });
      container.on('click', '.white.queen', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === 'white') { highlight(ev.target, 'wQ'); }
      });
      container.on('click', '.white.king', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === 'white') { highlight(ev.target, 'wK'); }
      });
    }

    if (playerColor === 'black') {
      container.on('click', '.black.pawn',   function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === 'black') { highlight(ev.target, 'bP'); }
      });
      container.on('click', '.black.rook',   function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === 'black') { highlight(ev.target, 'bR'); }
      });
      container.on('click', '.black.knight', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === 'black') { highlight(ev.target, 'bN'); }
      });
      container.on('click', '.black.bishop', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === 'black') { highlight(ev.target, 'bB'); }
      });
      container.on('click', '.black.queen',  function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === 'black') { highlight(ev.target, 'bQ'); }
      });
      container.on('click', '.black.king',   function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === 'black') { highlight(ev.target, 'bK'); }
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

    // En Passant Capture
    container.on('click', '.valid-en-passant-capture', function(ev) {
      var m = capture(ev.target);
      socket.emit('move', {gameID: gameID, move: m+'ep'});
    });

    // Castle
    container.on('click', '.valid-castle', function(ev) {
      var m = castle(ev.target);
      socket.emit('move', {gameID: gameID, move: m});
    });
  };

  /* Highlight valid moves for selected piece */
  var highlight = function(squareElement, piece) {
    var square = $(squareElement);
    var move   = null;

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
    for (var i=0; i<gameState.validMoves.length; i++) {
      move = gameState.validMoves[i];

      if (move.pieceCode === piece && move.startSquare === square.attr('id')) {
        if (move.type === 'move') { $('#'+move.endSquare).addClass('valid-move'); }

        if (move.type === 'capture') {
          if (move.captureSquare !== move.endSquare) {
            $('#'+move.endSquare).addClass('valid-en-passant-capture');
          } else {
            $('#'+move.endSquare).addClass('valid-capture');
          }
        }
      }

      if (move.pieceCode === piece && move.type === 'castle') {
        if (move.pieceCode[0] === 'w' && move.boardSide === 'queen') {
          $('#c1').addClass('valid-castle');
        }
        if (move.pieceCode[0] === 'w' && move.boardSide === 'king') {
          $('#g1').addClass('valid-castle');
        }
        if (move.pieceCode[0] === 'b' && move.boardSide === 'queen') {
          $('#c8').addClass('valid-castle');
        }
        if (move.pieceCode[0] === 'b' && move.boardSide === 'king') {
          $('#g8').addClass('valid-castle');
        }
      }
    }
  };

  /* Clear valid move highlights */
  var clearHighlights = function() {
    squares.removeClass('selected');
    squares.removeClass('valid-move');
    squares.removeClass('valid-capture');
    squares.removeClass('valid-en-passant-capture');
    squares.removeClass('valid-castle');
  };

  /* Move piece in UI and send 'move' event to server */
  var move = function(squareElement) {
    var square       = $(squareElement);
    var pieceClasses = getPieceClasses(selection.color+selection.piece);

    // clear src
    $('#'+selection.file+selection.rank).removeClass(pieceClasses).addClass('empty');
    // populate dest
    square.removeClass('empty').addClass(pieceClasses);

    var promotion = '';
    if ((selection.color === 'w' && selection.piece === 'P' && square.attr('id')[1] === '8') ||
        (selection.color === 'b' && selection.piece === 'P' && square.attr('id')[1] === '1')) {
      promotion = 'pQ';
    }

    clearHighlights();

    return selection.color+selection.piece+selection.file+selection.rank+'-'+square.attr('id')+promotion;
  };

  /* Move piece in UI and send 'move' event to server */
  var capture = function(squareElement) {
    var square       = $(squareElement);
    var pieceClasses = getPieceClasses(selection.color+selection.piece);

    $('#'+selection.file+selection.rank).removeClass(pieceClasses).addClass('empty');
    square.removeClass().addClass(pieceClasses);

    var promotion = '';
    if ((selection.color === 'w' && selection.piece === 'P' && square.attr('id')[1] === '8') ||
        (selection.color === 'b' && selection.piece === 'P' && square.attr('id')[1] === '1')) {
      promotion = 'pQ';
    }

    clearHighlights();
    return selection.color+selection.piece+selection.file+selection.rank+'x'+square.attr('id')+promotion;
  };

  /* Move piece in UI and send 'move' event to server */
  var castle = function(squareElement) {
    var moveString = '';

    switch (squareElement.id) {
      case 'c1':
        $('e1').removeClass().addClass('empty');
        $('c1').removeClass('empty').addClass(getPieceClasses('wK'));

        $('a1').removeClass().addClass('empty');
        $('d1').removeClass('empty').addClass(getPieceClasses('wR'));

        moveString = 'wK0-0-0';
        break;

      case 'g1':
        $('e1').removeClass().addClass('empty');
        $('g1').removeClass('empty').addClass(getPieceClasses('wK'));

        $('h1').removeClass().addClass('empty');
        $('f1').removeClass('empty').addClass(getPieceClasses('wR'));

        moveString = 'wK0-0';
        break;

      case 'c8':
        $('e8').removeClass().addClass('empty');
        $('c8').removeClass('empty').addClass(getPieceClasses('bK'));

        $('a8').removeClass().addClass('empty');
        $('d8').removeClass('empty').addClass(getPieceClasses('bR'));

        moveString = 'bK0-0-0';
        break;

      case 'g8':
        $('e8').removeClass().addClass('empty');
        $('g8').removeClass('empty').addClass(getPieceClasses('bK'));

        $('h8').removeClass().addClass('empty');
        $('f8').removeClass('empty').addClass(getPieceClasses('bR'));

        moveString = 'bK0-0';
        break;
    }

    clearHighlights();

    return moveString;
  }

  /* Update UI from gameState */
  var updateBoard = function() {

    var you, opponent;
    if (gameState.players[0].color === playerColor) {
      you      = gameState.players[0];
      opponent = gameState.players[1];
    }
    if (gameState.players[1].color === playerColor) {
      you      = gameState.players[1];
      opponent = gameState.players[0];
    }

    // Player Name
    if (you.name)      { $('#you strong').text(you.name);           }
    if (opponent.name) { $('#opponent strong').text(opponent.name); }

    // Check
    var youStatus      = $('#you .status');
    var opponentStatus = $('#opponent .status');
    var labelClasses = 'label label-danger';

    youStatus.removeClass(labelClasses).text('');
    if (you.inCheck) { youStatus.addClass(labelClasses).text('Check'); }

    opponentStatus.removeClass(labelClasses).text('');
    if (opponent.inCheck) { opponentStatus.addClass(labelClasses).text('Check'); }

    // Captured Pieces
    var youCapturedPieces      = $('#you ul')
    var opponentCapturedPieces = $('#opponent ul');

    youCapturedPieces.empty();
    for (var i=0; i<gameState.capturedPieces.length; i++) {
      if (gameState.capturedPieces[i][0] === opponent.color[0]) {
        youCapturedPieces.append('<li class="'+getPieceClasses(gameState.capturedPieces[i])+'"></li>');
      }
    }
    opponentCapturedPieces.empty();
    for (var i=0; i<gameState.capturedPieces.length; i++) {
      if (gameState.capturedPieces[i][0] === you.color[0]) {
        opponentCapturedPieces.append('<li class="'+getPieceClasses(gameState.capturedPieces[i])+'"></li>');
      }
    }

    // Game Over Modal
    var gameOverPopup   = $('#game-over');
    var gameOverMessage = $('#game-over h2');

    if (gameState.status === 'checkmate') {
      if (you.inCheck)      { gameOverMessage.addClass("alert alert-danger").text('You Lose'); }
      if (opponent.inCheck) { gameOverMessage.addClass("alert alert-success").text('You Win'); }
      gameOverPopup.modal({keyboard: false, backdrop: 'static'});
    }

    if (gameState.status === 'stalemate') {
      gameOverMessage.addClass("alert alert-warning").text('Stalemate');
      gameOverPopup.modal({keyboard: false, backdrop: 'static'});
    }

    // Chessboard
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