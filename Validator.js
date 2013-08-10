var getValidDestinationsForPiece = function(piece, square, board) {
  switch (piece[1]) {
    case 'P':
      return getValidDestinationsForPawn(piece, square, board);
    case 'R':
      return getValidDestinationsForRook(piece, square, board);
    case 'N':
      return getValidDestinationsForKnight(piece, square, board);
    case 'B':
      return getValidDestinationsForBishop(piece, square, board);
    case 'Q':
      return getValidDestinationsForQueen(piece, square, board);
    case 'K':
      return getValidDestinationsForKing(piece, square, board);
    default:
      return {};
  }
};


var getValidDestinationsForPawn = function(piece, square, board) {
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


var getValidDestinationsForRook = function(piece, square, board) {
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


var getValidDestinationsForKnight = function(piece, square, board) {
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


var getValidDestinationsForBishop = function(piece, square, board) {
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


var getValidDestinationsForQueen = function(piece, square, board) {
  var validDestinations = { moves: [], captures: [] };

  var rook   = getValidDestinationsForRook(piece, square, board);
  var bishop = getValidDestinationsForBishop(piece, square, board);

  validDestinations.moves    = [].concat(rook.moves, bishop.moves);
  validDestinations.captures = [].concat(rook.captures, bishop.captures);

  return validDestinations;
};


var getValidDestinationsForKing = function(piece, square, board) {
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

exports.getValidDestinationsForPiece = getValidDestinationsForPiece;