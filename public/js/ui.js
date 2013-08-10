(function(window) {

  function UI() {

    var board   = $('#chess-board');
    var allSquares = board.find('td');

    var selection = null;
    var initialBoardState = {
      a8: 'bR_', b8: 'bN_', c8: 'bB_', d8: 'bQ_', e8: 'bK_', f8: 'bB_', g8: 'bN_', h8: 'bR_',
      a7: 'bP_', b7: 'bP_', c7: 'bP_', d7: 'bP_', e7: 'bP_', f7: 'bP_', g7: 'bP_', h7: 'bP_',
      a6: null,  b6: null,  c6: null,  d6: null,  e6: null,  f6: null,  g6: null,  h6: null,
      a5: null,  b5: null,  c5: null,  d5: null,  e5: null,  f5: null,  g5: null,  h5: null,
      a4: null,  b4: null,  c4: null,  d4: null,  e4: null,  f4: null,  g4: null,  h4: null,
      a3: null,  b3: null,  c3: null,  d3: null,  e3: null,  f3: null,  g3: null,  h3: null,
      a2: 'wP_', b2: 'wP_', c2: 'wP_', d2: 'wP_', e2: 'wP_', f2: 'wP_', g2: 'wP_', h2: 'wP_',
      a1: 'wR_', b1: 'wN_', c1: 'wB_', d1: 'wQ_', e1: 'wK_', f1: 'wB_', g1: 'wN_', h1: 'wR_'
    };

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

    this.updateBoard = function(boardState) {
      if (boardState === undefined) {
        boardState = initialBoardState;
      }

      for (var sq in boardState) {
        $('#'+sq).removeClass().addClass(getPieceClasses(boardState[sq]));
      }
    };

    this.highlight = function(squareElement, piece) {
      var square = $(squareElement);

      selection = {
        color: piece[0],
        piece: piece[1],
        file:  square.attr('id')[0],
        rank:  square.attr('id')[1]
      };

      // Highlight the current square
      allSquares.removeClass('selected');
      square.addClass('selected');

      // Highlight any valid moves
      allSquares.removeClass('valid-move valid-capture');
      for (var key in Client.gameState.validMoves.moves) {
        if (key === piece+square.attr('id')) {
          for (var i=0; i<Client.gameState.validMoves.moves[key].length; i++) {
            $('#'+Client.gameState.validMoves.moves[key][i]).addClass('valid-move');
          };
        }
      }
      for (var key in Client.gameState.validMoves.captures) {
        if (key === piece+square.attr('id')) {
          for (var i=0; i<Client.gameState.validMoves.captures[key].length; i++) {
            $('#'+Client.gameState.validMoves.captures[key][i]).addClass('valid-capture');
          };
        }
      }
    };

    this.clearHighlight = function() {
      allSquares.removeClass('selected');
      allSquares.removeClass('valid-move');
      allSquares.removeClass('valid-capture');
    };

    this.move = function(squareElement) {
      var square       = $(squareElement);
      var pieceClasses = getPieceClasses(selection.color+selection.piece);

      // clear src
      $('#'+selection.file+selection.rank).removeClass(pieceClasses).addClass('empty');
      // populate dest
      square.removeClass('empty').addClass(pieceClasses);

      window.Client.UI.clearHighlight();

      return selection.color+selection.piece+selection.file+selection.rank+'-'+square.attr('id');
    };

    this.capture = function(squareElement) {
      var square       = $(squareElement);
      var pieceClasses = getPieceClasses(selection.color+selection.piece);

      $('#'+selection.file+selection.rank).removeClass(pieceClasses).addClass('empty');
      square.removeClass().addClass(pieceClasses);

      window.Client.UI.clearHighlight();
      return selection.color+selection.piece+selection.file+selection.rank+'x'+square.attr('id');
    };
  };

  window.Client.UI = new UI();
}(window));