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

  var selection   = null;


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

    // Assign IDs to squares based on player's color/perspective
    if (playerColor === 'black') { squareIDs.reverse(); }
    squares.each(function(i) { $(this).attr('id', squareIDs[i]); });

    // Create socket connection
    socket = io.connect();

    // Attach event handlers
    attachDOMEventHandlers();
    attachSocketEventHandlers();

    // Join game
    socket.emit('join', gameID);
  };

  /* Attach DOM event handlers */
  var attachDOMEventHandlers = function() {

    // Highlight valid moves for white pieces
    if (playerColor === 'white') {
      container.on('click', '.white.pawn', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === playerColor) {
          highlightValidMoves('wP', ev.target);
        }
      });
      container.on('click', '.white.rook', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === playerColor) {
          highlightValidMoves('wR', ev.target);
        }
      });
      container.on('click', '.white.knight', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === playerColor) {
          highlightValidMoves('wN', ev.target);
        }
      });
      container.on('click', '.white.bishop', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === playerColor) {
          highlightValidMoves('wB', ev.target);
        }
      });
      container.on('click', '.white.queen', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === playerColor) {
          highlightValidMoves('wQ', ev.target);
        }
      });
      container.on('click', '.white.king', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === playerColor) {
          highlightValidMoves('wK', ev.target);
        }
      });
    }

    // Highlight valid moves for black pieces
    if (playerColor === 'black') {
      container.on('click', '.black.pawn',   function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === playerColor) {
          highlightValidMoves('bP', ev.target);
        }
      });
      container.on('click', '.black.rook',   function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === playerColor) {
          highlightValidMoves('bR', ev.target);
        }
      });
      container.on('click', '.black.knight', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === playerColor) {
          highlightValidMoves('bN', ev.target);
        }
      });
      container.on('click', '.black.bishop', function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === playerColor) {
          highlightValidMoves('bB', ev.target);
        }
      });
      container.on('click', '.black.queen',  function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === playerColor) {
          highlightValidMoves('bQ', ev.target);
        }
      });
      container.on('click', '.black.king',   function(ev) {
        if (gameState.activePlayer && gameState.activePlayer.color === playerColor) {
          highlightValidMoves('bK', ev.target);
        }
      });
    }

    // Clear all move highlights
    container.on('click', '.empty', function(ev) {
      clearHighlights();
    });

    // Perform a regular move
    container.on('click', '.valid-move', function(ev) {
      var m = move(ev.target);

      // Test for pawn promotion
      if (/wP....8/.test(m) || /bP....1/.test(m)) {
        showPawnPromotionPrompt(function(p) {
          // replace piece
          socket.emit('move', {gameID: gameID, move: m+p});
        });
      } else {
        socket.emit('move', {gameID: gameID, move: m});
      }
    });

    // Perform a regular capture
    container.on('click', '.valid-capture', function(ev) {
      var m = capture(ev.target);

      // Test for pawn promotion
      if (/wP....8/.test(m) || /bP....1/.test(m)) {
        showPawnPromotionPrompt(function(p) {
          // replace piece
          socket.emit('move', {gameID: gameID, move: m+p});
        });
      } else {
        socket.emit('move', {gameID: gameID, move: m});
      }
    });

    // Perform an en passant capture
    container.on('click', '.valid-en-passant-capture', function(ev) {
      var m = capture(ev.target);
      socket.emit('move', {gameID: gameID, move: m+'ep'});
    });

    // Perform a castle
    container.on('click', '.valid-castle', function(ev) {
      var m = castle(ev.target);
      socket.emit('move', {gameID: gameID, move: m});
    });
  };

  /* Attach Socket.IO event handlers */
  var attachSocketEventHandlers = function() {

    // Update UI with new game state
    socket.on('update', function(data) {
      console.log(data);
      gameState = data;
      update();
    });

    // Display an error
    socket.on('error', function(data) {
      console.log(data);
      // TODO create a popup
    });
  };

  /* Highlight valid moves for selected piece */
  var highlightValidMoves = function(piece, selectedSquare) {
    var square = $(selectedSquare);
    var move   = null;

    // Set selection object
    selection = {
      color: piece[0],
      piece: piece[1],
      file:  square.attr('id')[0],
      rank:  square.attr('id')[1]
    };

    // Highlight the selected square
    squares.removeClass('selected');
    square.addClass('selected');

    // Highlight any valid moves
    squares.removeClass('valid-move valid-capture valid-en-passant-capture valid-castle');
    for (var i=0; i<gameState.validMoves.length; i++) {
      move = gameState.validMoves[i];

      if (move.type === 'move') {
        if (move.pieceCode === piece && move.startSquare === square.attr('id')) {
          $('#'+move.endSquare).addClass('valid-move');
        }
      }

      if (move.type === 'capture') {
        if (move.pieceCode === piece && move.startSquare === square.attr('id')) {
          if (move.captureSquare === move.endSquare) {
            $('#'+move.endSquare).addClass('valid-capture');
          } else {
            $('#'+move.endSquare).addClass('valid-en-passant-capture');
          }
        }
      }

      if (move.type === 'castle') {
        if (move.pieceCode === piece) {
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

  /* Move selected piece to destination square */
  var move = function(destinationSquare) {
    var piece = selection.color+selection.piece;
    var src   = $('#'+selection.file+selection.rank);
    var dest  = $(destinationSquare);

    clearHighlights();

    // Move piece on board
    src.removeClass(getPieceClasses(piece)).addClass('empty');
    dest.removeClass('empty').addClass(getPieceClasses(piece));

    // Return move string
    return piece+selection.file+selection.rank+'-'+dest.attr('id');
  };

  /* Move selected piece to destination square and capture its inhabitant */
  var capture = function(destinationSquare) {
    var piece = selection.color+selection.piece;
    var src   = $('#'+selection.file+selection.rank);
    var dest  = $(destinationSquare);

    clearHighlights();

    // Move piece on board
    src.removeClass(getPieceClasses(piece)).addClass('empty');
    dest.removeClass().addClass(getPieceClasses(piece));

    // Return move string
    return piece+selection.file+selection.rank+'x'+dest.attr('id');
  };

  /* Castle the selected king */
  var castle = function(destinationSquare) {
    var moveString = '';

    switch (destinationSquare.id) {

      // White queenside castle
      case 'c1':
        $('e1').removeClass().addClass('empty');
        $('c1').removeClass('empty').addClass(getPieceClasses('wK'));
        $('a1').removeClass().addClass('empty');
        $('d1').removeClass('empty').addClass(getPieceClasses('wR'));
        moveString = 'wK0-0-0';
        break;

      // White kingside castle
      case 'g1':
        $('e1').removeClass().addClass('empty');
        $('g1').removeClass('empty').addClass(getPieceClasses('wK'));
        $('h1').removeClass().addClass('empty');
        $('f1').removeClass('empty').addClass(getPieceClasses('wR'));
        moveString = 'wK0-0';
        break;

      // Black queenside castle
      case 'c8':
        $('e8').removeClass().addClass('empty');
        $('c8').removeClass('empty').addClass(getPieceClasses('bK'));
        $('a8').removeClass().addClass('empty');
        $('d8').removeClass('empty').addClass(getPieceClasses('bR'));
        moveString = 'bK0-0-0';
        break;

      // Black kingside castle
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
  var update = function() {
    var you, opponent = null;

    var container, name, status, captures = null;

    // Update player info
    for (var i=0; i<gameState.players.length; i++) {

      // Determine if player is you or opponent
      if (gameState.players[i].color === playerColor) {
        you = gameState.players[i];
        container = $('#you');
      }
      else if (gameState.players[i].color !== playerColor) {
        opponent = gameState.players[i];
        container = $('#opponent');
      }

      name     = container.find('strong');
      status   = container.find('.status');
      captures = container.find('ul');

      // Name
      if (gameState.players[i].name) {
        name.text(gameState.players[i].name);
      }

      // Active Status
      container.removeClass('active-player');
      if (gameState.activePlayer && gameState.activePlayer.color === gameState.players[i].color) {
        container.addClass('active-player');
      }

      // Check Status
      status.removeClass('label label-danger').text('');
      if (gameState.players[i].inCheck) {
        status.addClass('label label-danger').text('Check');
      }

      // Captured Pieces
      captures.empty();
      for (var j=0; j<gameState.capturedPieces.length; j++) {
        if (gameState.capturedPieces[j][0] !== gameState.players[i].color[0]) {
          captures.append('<li class="'+getPieceClasses(gameState.capturedPieces[j])+'"></li>');
        }
      }
    }

    // Update board
    for (var sq in gameState.board) {
      $('#'+sq).removeClass().addClass(getPieceClasses(gameState.board[sq]));
    }

    // Test for checkmate
    if (gameState.status === 'checkmate') {
      if (opponent.inCheck) { showGameOverMessage('checkmate-win');  }
      if (you.inCheck)      { showGameOverMessage('checkmate-lose'); }
    }

    // Test for stalemate
    if (gameState.status === 'stalemate') { showGameOverMessage('stalemate'); }
  };

  /* Show the game over popup */
  var showGameOverMessage = function(type) {
    var msg, html = '';

    switch (type) {
      case 'checkmate-win'  : msg = '<h2 class="alert alert-success">You Win</h2>'; break;
      case 'checkmate-lose' : msg = '<h2 class="alert alert-danger">You Lose</h2>'; break;
      case 'stalemate'      : msg = '<h2 class="alert alert-warning">Stalemate</h2>'; break;
    }

    html = '<div id="game-over" class="modal fade" role="dialog">' +
           '  <div class="modal-dialog">' +
           '    <div class="modal-content">' +
           '      <div class="modal-header">' +
           '        <h3 class="modal-title">Game Over</h3>' +
           '      </div>' +
           '      <div class="modal-body text-center">' +
                    msg +
           '      </div>' +
           '      <div class="modal-footer">' +
           '        <a class="btn btn-primary" href="/">Continue</a>' +
           '      </div>' +
           '    </div>' +
           '  </div>' +
           '</div>';

    $('.container').append(html);
    // maybe add dismiss class to markup
    $('#game-over').modal({keyboard: false, backdrop: 'static'});
  };

  /* Prompt user for pawn promotion via a modal popup */
  var showPawnPromotionPrompt = function(callback) {
    var html = '';
    var prompt = null;

    html = '<div id="pawn-promotion" class="modal fade" role="dialog">' +
           '  <div class="modal-dialog">' +
           '    <div class="modal-content">' +
           '      <div class="modal-header">' +
           '        <h3 class="modal-title">Pawn Promotion</h3>' +
           '      </div>' +
           '      <div class="modal-body text-center">' +
           '        <form>' +
           '          <p><strong>Promote to</strong></p>' +
           '            <div class="btn-group" data-toggle="buttons">' +
           '              <label class="btn btn-default '+playerColor+' knight">' +
           '                <input type="radio" name="promotion" value="N"></input>' +
           '              </label>' +
           '              <label class="btn btn-default '+playerColor+' bishop">' +
           '                <input type="radio" name="promotion" value="B"></input>' +
           '              </label>' +
           '              <label class="btn btn-default '+playerColor+' rook">' +
           '                <input type="radio" name="promotion" value="R"></input>' +
           '              </label>' +
           '              <label class="btn btn-default '+playerColor+' queen active">' +
           '                <input type="radio" name="promotion" value="Q" checked="checked"></input>' +
           '              </label>' +
           '            </div>' +
           '        </form>' +
           '      </div>' +
           '      <div class="modal-footer">' +
           '        <button class="btn btn-primary">Promote</button>' +
           '      </div>' +
           '    </div>' +
           '  </div>' +
           '</div>';

    $('.container').append(html);

    prompt = $('#pawn-promotion');

    prompt.on('click', 'button', function(ev) {
      var selection = prompt.find("input[type='radio'][name='promotion']:checked").val();
      callback('p'+selection);
      prompt.modal('hide');
    });

    prompt.modal({keyboard: false, backdrop: 'static'});
  };

  /* Get CSS classes for piece */
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