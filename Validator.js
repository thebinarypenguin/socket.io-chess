var getValidMoves = function(playerColor, board) {
  var allDestinations = null;
  var validMoves = {};
  var key = null;
  var val = null;

  for (var sq in board) {
    if (board[sq] !== null && board[sq][0] === playerColor[0]) {
      allDestinations = getDestinationsForPiece(board[sq], sq, board);

      // moves
      for (var i=0; i<allDestinations.moves.length; i++) {
        key = board[sq].substring(0, 2) + sq;
        val = allDestinations.moves[i];
        if (isMoveValid(key+'-'+val, board)) {
          if (!validMoves.hasOwnProperty('moves')) {
            validMoves['moves'] = {};
          }
          if (!validMoves.moves.hasOwnProperty(key)) {
            validMoves.moves[key] = [];
          }
          validMoves.moves[key].push(val);
        }
      }

      // captures
      for (var i=0; i<allDestinations.captures.length; i++) {
        key = board[sq].substring(0, 2) + sq;
        val = allDestinations.captures[i];
        if (isMoveValid(key+'x'+val, board)) {
          if (!validMoves.hasOwnProperty('captures')) {
            validMoves['captures'] = {};
          }
          if (!validMoves.captures.hasOwnProperty(key)) {
            validMoves.captures[key] = [];
          }
          validMoves.captures[key].push(val);
        }
      }

    }
  }

  return validMoves;
};


var getDestinationsForPiece = function(piece, square, board) {
  switch (piece[1]) {
    case 'P': return getDestinationsForPawn(piece, square, board);
    case 'R': return getDestinationsForRook(piece, square, board);
    case 'N': return getDestinationsForKnight(piece, square, board);
    case 'B': return getDestinationsForBishop(piece, square, board);
    case 'Q': return getDestinationsForQueen(piece, square, board);
    case 'K': return getDestinationsForKing(piece, square, board);
    default : return {};
  }
};


var getDestinationsForPawn = function(piece, square, board) {
  var destination       = null;
  var opponentsColor    = null;
  var validDestinations = { moves: [], captures: [] };

  var move    = [];
  var capture = [];

  if (piece[0] === 'w') {
    move    = (piece[2] === '_') ? [{x:+0, y:+1}, {x:+0, y:+2}] : [{x:+0, y:+1}];
    capture = [{x:+1, y:+1}, {x:-1, y:+1}];
    opponentsColor = 'b';
  }

  if (piece[0] === 'b') {
    move    = (piece[2] === '_') ? [{x:+0, y:-1}, {x:+0, y:-2}] : [{x:+0, y:-1}];
    capture = [{x:+1, y:-1}, {x:-1, y:-1}];
    opponentsColor = 'w';
  }

  // Move
  for (var i=0; i<move.length; i++) {
    destination = translate(square, move[i]);
    if (destination) {
      // If destination square is empty
      if (board[destination] === null) {
        validDestinations.moves.push(destination);
      } else {
        break;
      }
    }
  }

  // Capture
  for (var i=0; i<capture.length; i++) {
    destination = translate(square, capture[i]);
    if (destination) {
      // If destination square is occupied by opponent
      if (board[destination] !== null && board[destination][0] === opponentsColor) {
        validDestinations.captures.push(destination);
      }
    }
  }

  return validDestinations;
};


var getDestinationsForRook = function(piece, square, board) {
  var destination       = null;
  var opponentsColor    = null;
  var validDestinations = { moves: [], captures: [] };

  var north = [{x:0, y:+1}, {x:0, y:+2}, {x:0, y:+3}, {x:0, y:+4}, {x:0, y:+5}, {x:0, y:+6}, {x:0, y:+7}];
  var east  = [{x:+1, y:0}, {x:+2, y:0}, {x:+3, y:0}, {x:+4, y:0}, {x:+5, y:0}, {x:+6, y:0}, {x:+7, y:0}];
  var south = [{x:0, y:-1}, {x:0, y:-2}, {x:0, y:-3}, {x:0, y:-4}, {x:0, y:-5}, {x:0, y:-6}, {x:0, y:-7}];
  var west  = [{x:-1, y:0}, {x:-2, y:0}, {x:-3, y:0}, {x:-4, y:0}, {x:-5, y:0}, {x:-6, y:0}, {x:-7, y:0}];

  if (piece[0] === 'w') { opponentsColor = 'b'; }
  if (piece[0] === 'b') { opponentsColor = 'w'; }

  [north, east, south, west].forEach(function(group) {
    for (var i=0; i<group.length; i++) {
      destination = translate(square, group[i]);
      if (destination) {
        // If destination square is empty
        if (board[destination] === null) {
          validDestinations.moves.push(destination);
        // If destination square is occupied by opponent
        } else if (board[destination][0] === opponentsColor) {
          validDestinations.captures.push(destination);
          break;
        } else {
          break;
        }
      }
    }
  });

  return validDestinations;
};


var getDestinationsForKnight = function(piece, square, board) {
  var destination       = null;
  var opponentsColor    = null;
  var validDestinations = { moves: [], captures: [] };

  var all = [
    {x:+1, y:+2 },
    {x:+2, y:+1 },
    {x:+2, y:-1 },
    {x:+1, y:-2 },
    {x:-1, y:-2 },
    {x:-2, y:-1 },
    {x:-2, y:+1 },
    {x:-1, y:+2 }
  ];

  if (piece[0] === 'w') { opponentsColor = 'b'; }
  if (piece[0] === 'b') { opponentsColor = 'w'; }

  for (var i=0; i<all.length; i++) {
    destination = translate(square, all[i]);
    if (destination) {
      // If destination square is empty
      if (board[destination] === null) {
        validDestinations.moves.push(destination);
      // If destination square is occupied by opponent
      } else if (board[destination][0] === opponentsColor) {
        validDestinations.captures.push(destination);
      }
    }
  }

  return validDestinations;
};


var getDestinationsForBishop = function(piece, square, board) {
  var destination       = null;
  var opponentsColor    = null;
  var validDestinations = { moves: [], captures: [] };

  var northEast = [{x:+1, y:+1}, {x:+2, y:+2}, {x:+3, y:+3}, {x:+4, y:+4}, {x:+5, y:+5}, {x:+6, y:+6}, {x:+7, y:+7}];
  var southEast = [{x:+1, y:-1}, {x:+2, y:-2}, {x:+3, y:-3}, {x:+4, y:-4}, {x:+5, y:-5}, {x:+6, y:-6}, {x:+7, y:-7}];
  var southWest = [{x:-1, y:-1}, {x:-2, y:-2}, {x:-3, y:-3}, {x:-4, y:-4}, {x:-5, y:-5}, {x:-6, y:-6}, {x:-7, y:-7}];
  var northWest = [{x:-1, y:+1}, {x:-2, y:+2}, {x:-3, y:+3}, {x:-4, y:+4}, {x:-5, y:+5}, {x:-6, y:+6}, {x:-7, y:+7}];

  if (piece[0] === 'w') { opponentsColor = 'b'; }
  if (piece[0] === 'b') { opponentsColor = 'w'; }

  [northEast, southEast, southWest, northWest].forEach(function(group) {
    for (var i=0; i<group.length; i++) {
      destination = translate(square, group[i]);
      if (destination) {
        // If destination square is empty
        if (board[destination] === null) {
          validDestinations.moves.push(destination);
        // If destination square is occupied by opponent
        } else if (board[destination][0] === opponentsColor) {
          validDestinations.captures.push(destination);
          break;
        } else {
          break;
        }
      }
    }
  });

  return validDestinations;
};


var getDestinationsForQueen = function(piece, square, board) {
  var validDestinations = { moves: [], captures: [] };

  var rook   = getDestinationsForRook(piece, square, board);
  var bishop = getDestinationsForBishop(piece, square, board);

  validDestinations.moves    = [].concat(rook.moves, bishop.moves);
  validDestinations.captures = [].concat(rook.captures, bishop.captures);

  return validDestinations;
};


var getDestinationsForKing = function(piece, square, board) {
  var destination       = null;
  var opponentsColor    = null;
  var validDestinations = { moves: [], captures: [] };

  var all = [
    {x:0,  y:+1 },
    {x:+1, y:+1 },
    {x:+1, y:0 },
    {x:+1, y:-1 },
    {x:0,  y:-1 },
    {x:-1, y:-1 },
    {x:-1, y:0 },
    {x:-1, y:+1 }
  ];

  if (piece[0] === 'w') { opponentsColor = 'b'; }
  if (piece[0] === 'b') { opponentsColor = 'w'; }

  for (var i=0; i<all.length; i++) {
    destination = translate(square, all[i]);
    if (destination) {
      // If destination square is empty
      if (board[destination] === null) {
        validDestinations.moves.push(destination);
      // If destination square is occupied by opponent
      } else if (board[destination][0] === opponentsColor) {
        validDestinations.captures.push(destination);
      }
    }
  }

  return validDestinations;
};


var translate = function(square, transform) {
  var alpha2num = function(a) {
    switch (a) {
      case 'a': return 1;
      case 'b': return 2;
      case 'c': return 3;
      case 'd': return 4;
      case 'e': return 5;
      case 'f': return 6;
      case 'g': return 7;
      case 'h': return 8;
      default : return 9; // out of bounds
    }
  };

  var num2alpha = function(n) {
    switch (n) {
       case 1: return 'a';
       case 2: return 'b';
       case 3: return 'c';
       case 4: return 'd';
       case 5: return 'e';
       case 6: return 'f';
       case 7: return 'g';
       case 8: return 'h';
      default: return 'i'; // out of bounds
    }
  };

  var file = square[0];
  var rank = parseInt(square[1], 10);

  var destFile = alpha2num(file) + transform.x;
  var destRank = rank + transform.y;

  if (destFile < 1 || destFile > 8) { return false; }
  if (destRank < 1 || destRank > 8) { return false; }

  return num2alpha(destFile) + destRank;
};


var isPlayerInCheck = function(playerColor, board) {
  var opponentsColor = null;
  var kingSquare     = null;
  var destinations   = {};

  if (playerColor[0] === 'w') { opponentsColor = 'b'; }
  if (playerColor[0] === 'b') { opponentsColor = 'w'; }

  // Calc king square
  for (sq in board) {
    if (board[sq] !== null) {
      if (board[sq][0] === playerColor[0] && board[sq][1] === 'K') {
        kingSquare = sq;
        break;
      }
    }
  }

  // Is an opponents pawn within striking distance?
  destinations = getDestinationsForPiece(playerColor[0]+'P', kingSquare, board);
  for (var i=0; i<destinations.captures.length; i++) {
    if (board[destinations.captures[i]] === opponentsColor+'P') {
      return true;
    }
  };

  // Is an opponents knight within striking distance?
  destinations = getDestinationsForPiece(playerColor[0]+'N', kingSquare, board);
  for (var i=0; i<destinations.captures.length; i++) {
    if (board[destinations.captures[i]] === opponentsColor+'N') {
      return true;
    }
  };

  // Is an opponents king within striking distance?
  destinations = getDestinationsForPiece(playerColor[0]+'K', kingSquare, board);
  for (var i=0; i<destinations.captures.length; i++) {
    if (board[destinations.captures[i]] === opponentsColor+'K') {
      return true;
    }
  };

  // Is an opponents rook or queen within striking distance?
  destinations = getDestinationsForPiece(playerColor[0]+'R', kingSquare, board);
  for (var i=0; i<destinations.captures.length; i++) {
    if (board[destinations.captures[i]] === opponentsColor+'R' || board[destinations.captures[i]] === opponentsColor+'Q') {
      return true;
    }
  };

  // Is an opponents bishop or queen within striking distance?
  destinations = getDestinationsForPiece(playerColor[0]+'B', kingSquare, board);
  for (var i=0; i<destinations.captures.length; i++) {
    if (board[destinations.captures[i]] === opponentsColor+'B' || board[destinations.captures[i]] === opponentsColor+'Q') {
      return true;
    }
  };

  // Safe!
  return false;
};


var isMoveValid = function(move, board) {
  var playerColor = null;
  var testBoard   = {};
  var startSquare = move[2] + move[3];
  var endSquare   = move[5] + move[6];

  if (move[0] === 'w') { playerColor = 'white'; }
  if (move[0] === 'b') { playerColor = 'black'; }

  // Create a local copy of the board to test against
  for (prop in board) {
    testBoard[prop] = board[prop];
  }

  // Apply move
  testBoard[endSquare] = testBoard[startSquare].substring(0, 2);
  testBoard[startSquare] = null;

  // If player is in check then this is an invalid move
  return (isPlayerInCheck(playerColor, testBoard)) ? false : true ;
};


exports.getValidMoves = getValidMoves;
exports.isPlayerInCheck = isPlayerInCheck;