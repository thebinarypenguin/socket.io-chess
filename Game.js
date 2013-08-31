/**
 * Construct and initialize a game object
 */
function Game(params) {

  this.ready        = false;
  this.stalemate    = false;
  this.winner       = null;
  this.activePlayer = null;

  // change to this.players and use underscore to filter
  this.player1 = {color: null, name: null, inCheck: false, checkmated: false, joined: false},
  this.player2 = {color: null, name: null, inCheck: false, checkmated: false, joined: false},

  this.board = {
    a8: 'bR_', b8: 'bN_', c8: 'bB_', d8: 'bQ_', e8: 'bK_', f8: 'bB_', g8: 'bN_', h8: 'bR_',
    a7: 'bP_', b7: 'bP_', c7: 'bP_', d7: 'bP_', e7: 'bP_', f7: 'bP_', g7: 'bP_', h7: 'bP_',
    a6: null,  b6: null,  c6: null,  d6: null,  e6: null,  f6: null,  g6: null,  h6: null,
    a5: null,  b5: null,  c5: null,  d5: null,  e5: null,  f5: null,  g5: null,  h5: null,
    a4: null,  b4: null,  c4: null,  d4: null,  e4: null,  f4: null,  g4: null,  h4: null,
    a3: null,  b3: null,  c3: null,  d3: null,  e3: null,  f3: null,  g3: null,  h3: null,
    a2: 'wP_', b2: 'wP_', c2: 'wP_', d2: 'wP_', e2: 'wP_', f2: 'wP_', g2: 'wP_', h2: 'wP_',
    a1: 'wR_', b1: 'wN_', c1: 'wB_', d1: 'wQ_', e1: 'wK_', f1: 'wB_', g1: 'wN_', h1: 'wR_'
  };

  this.capturedPieces = [];

  this.validMoves = {
    moves: {
      wPa2: ['a3', 'a4'],
      wPb2: ['b3', 'b4'],
      wPc2: ['c3', 'c4'],
      wPd2: ['d3', 'd4'],
      wPe2: ['e3', 'e4'],
      wPf2: ['f3', 'f4'],
      wPg2: ['g3', 'g4'],
      wPh2: ['h3', 'h4'],
      wNb1: ['a3', 'c3'],
      wNg1: ['f3', 'h3']
    },
    captures: {}
  };

  // Set player colors
  if (params.playerColor === 'white') {
    this.player1.color = 'white';
    this.player2.color = 'black';
  }

  if (params.playerColor === 'black') {
    this.player1.color = 'black';
    this.player2.color = 'white';
  }
}

/**
 * Add a player to the game join
 */
Game.prototype.addPlayer = function(playerData) {
  // Check for open spots
  if (playerData.playerColor === this.player1.color && this.player1.joined) {
    return false;
  }
  if (playerData.playerColor === this.player2.color && this.player2.joined) {
    return false;
  }

  // Add player 1
  if (playerData.playerColor === this.player1.color) {
    this.player1.name   = playerData.playerName;
    this.player1.joined = true;
  }

  // Add player 2
  if (playerData.playerColor === this.player2.color) {
    this.player2.name   = playerData.playerName;
    this.player2.joined = true;
  }

  // Activate game when last player is added
  if (!this.ready && this.player1.joined && this.player2.joined) {
    // Set active player
    if (this.player1.color === 'white') { this.activePlayer = this.player1; }
    if (this.player2.color === 'white') { this.activePlayer = this.player2; }

    this.ready = true;
  }

  return true;
};

/**
 * Remove a player from the game
 */
Game.prototype.removePlayer = function(playerData) {
  if (this.player1.color === playerData.playerColor) {
    this.player1.joined = false;
    return true
  }

  if (this.player2.color === playerData.playerColor) {
    this.player2.joined = false;
    return true;
  }

  return false;
};

/**
 * Apply a move to the game
 */
Game.prototype.move = function(moveString) {
  var piece = moveString[0] + moveString[1];
  var start = moveString[2] + moveString[3];
  var end   = moveString[5] + moveString[6];

  // Make sure move is in validMoves object
  if (this.validMoves.moves && this.validMoves.moves.hasOwnProperty(piece+start) && this.validMoves.moves[piece+start].indexOf(end) !== -1) {
    this.board[end] = this.board[start].substring(0, 2);
    this.board[start] = null;
  } else if (this.validMoves.captures && this.validMoves.captures.hasOwnProperty(piece+start) && this.validMoves.captures[piece+start].indexOf(end) !== -1) {
    this.capturedPieces.push(this.board[end]);
    this.board[end] = this.board[start].substring(0, 2);
    this.board[start] = null;
  } else {
    return false;
  }

  // Set active player
  if (piece[0] === 'w') {
    if (this.player1.color === 'black') { this.activePlayer = this.player1; }
    if (this.player2.color === 'black') { this.activePlayer = this.player2; }
  }
  if (piece[0] === 'b') {
    if (this.player1.color === 'white') { this.activePlayer = this.player1; }
    if (this.player2.color === 'white') { this.activePlayer = this.player2; }
  }

  // Regenerate valid moves
  this.validMoves = this._getValidMoves(this.activePlayer.color, this.board);

  // Set check status for both players
  this.player1.inCheck = this._isPlayerInCheck(this.player1.color, this.board);
  this.player2.inCheck = this._isPlayerInCheck(this.player2.color, this.board);

  // Test for Checkmate or Stalemate
  if (!this.validMoves.hasOwnProperty('moves') && !this.validMoves.hasOwnProperty('captures')) {
    if (this.activePlayer.inCheck) {
      this.activePlayer.checkmated = true;
    } else {
      this.stalemate = true;
    }
  }

  // Test for winner
  if (this.player1.checkmated) { this.winner = this.player2; }
  if (this.player2.checkmated) { this.winner = this.player1; }

  return true;
};

/*
 * Pseudo-Private Methods
 */

Game.prototype._getValidMoves = function(playerColor, board) {
  var allDestinations = null;
  var validMoves = {};
  var key = null;
  var val = null;

  for (var sq in board) {
    if (board[sq] !== null && board[sq][0] === playerColor[0]) {
      allDestinations = this._getDestinationsForPiece(board[sq], sq, board);

      // moves
      for (var i=0; i<allDestinations.moves.length; i++) {
        key = board[sq].substring(0, 2) + sq;
        val = allDestinations.moves[i];
        if (this._isMoveValid(key+'-'+val, board)) {
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
        if (this._isMoveValid(key+'x'+val, board)) {
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


Game.prototype._getDestinationsForPiece = function(piece, square, board) {
  switch (piece[1]) {
    case 'P': return this._getDestinationsForPawn(piece, square, board);
    case 'R': return this._getDestinationsForRook(piece, square, board);
    case 'N': return this._getDestinationsForKnight(piece, square, board);
    case 'B': return this._getDestinationsForBishop(piece, square, board);
    case 'Q': return this._getDestinationsForQueen(piece, square, board);
    case 'K': return this._getDestinationsForKing(piece, square, board);
    default : return {};
  }
};


Game.prototype._getDestinationsForPawn = function(piece, square, board) {
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
    destination = this._translate(square, move[i]);
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
    destination = this._translate(square, capture[i]);
    if (destination) {
      // If destination square is occupied by opponent
      if (board[destination] !== null && board[destination][0] === opponentsColor) {
        validDestinations.captures.push(destination);
      }
    }
  }

  return validDestinations;
};


Game.prototype._getDestinationsForRook = function(piece, square, board) {
  var destination       = null;
  var opponentsColor    = null;
  var validDestinations = { moves: [], captures: [] };

  var north = [{x:0, y:+1}, {x:0, y:+2}, {x:0, y:+3}, {x:0, y:+4}, {x:0, y:+5}, {x:0, y:+6}, {x:0, y:+7}];
  var east  = [{x:+1, y:0}, {x:+2, y:0}, {x:+3, y:0}, {x:+4, y:0}, {x:+5, y:0}, {x:+6, y:0}, {x:+7, y:0}];
  var south = [{x:0, y:-1}, {x:0, y:-2}, {x:0, y:-3}, {x:0, y:-4}, {x:0, y:-5}, {x:0, y:-6}, {x:0, y:-7}];
  var west  = [{x:-1, y:0}, {x:-2, y:0}, {x:-3, y:0}, {x:-4, y:0}, {x:-5, y:0}, {x:-6, y:0}, {x:-7, y:0}];

  if (piece[0] === 'w') { opponentsColor = 'b'; }
  if (piece[0] === 'b') { opponentsColor = 'w'; }

  var crap = this;
  [north, east, south, west].forEach(function(group) {
    for (var i=0; i<group.length; i++) {
      destination = crap._translate(square, group[i]);
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


Game.prototype._getDestinationsForKnight = function(piece, square, board) {
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
    destination = this._translate(square, all[i]);
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


Game.prototype._getDestinationsForBishop = function(piece, square, board) {
  var destination       = null;
  var opponentsColor    = null;
  var validDestinations = { moves: [], captures: [] };

  var northEast = [{x:+1, y:+1}, {x:+2, y:+2}, {x:+3, y:+3}, {x:+4, y:+4}, {x:+5, y:+5}, {x:+6, y:+6}, {x:+7, y:+7}];
  var southEast = [{x:+1, y:-1}, {x:+2, y:-2}, {x:+3, y:-3}, {x:+4, y:-4}, {x:+5, y:-5}, {x:+6, y:-6}, {x:+7, y:-7}];
  var southWest = [{x:-1, y:-1}, {x:-2, y:-2}, {x:-3, y:-3}, {x:-4, y:-4}, {x:-5, y:-5}, {x:-6, y:-6}, {x:-7, y:-7}];
  var northWest = [{x:-1, y:+1}, {x:-2, y:+2}, {x:-3, y:+3}, {x:-4, y:+4}, {x:-5, y:+5}, {x:-6, y:+6}, {x:-7, y:+7}];

  if (piece[0] === 'w') { opponentsColor = 'b'; }
  if (piece[0] === 'b') { opponentsColor = 'w'; }

  var crap = this;
  [northEast, southEast, southWest, northWest].forEach(function(group) {
    for (var i=0; i<group.length; i++) {
      destination = crap._translate(square, group[i]);
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


Game.prototype._getDestinationsForQueen = function(piece, square, board) {
  var validDestinations = { moves: [], captures: [] };

  var rook   = this._getDestinationsForRook(piece, square, board);
  var bishop = this._getDestinationsForBishop(piece, square, board);

  validDestinations.moves    = [].concat(rook.moves, bishop.moves);
  validDestinations.captures = [].concat(rook.captures, bishop.captures);

  return validDestinations;
};


Game.prototype._getDestinationsForKing = function(piece, square, board) {
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
    destination = this._translate(square, all[i]);
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


Game.prototype._translate = function(square, transform) {
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


Game.prototype._isPlayerInCheck = function(playerColor, board) {
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
  destinations = this._getDestinationsForPiece(playerColor[0]+'P', kingSquare, board);
  for (var i=0; i<destinations.captures.length; i++) {
    if (board[destinations.captures[i]] === opponentsColor+'P') {
      return true;
    }
  };

  // Is an opponents knight within striking distance?
  destinations = this._getDestinationsForPiece(playerColor[0]+'N', kingSquare, board);
  for (var i=0; i<destinations.captures.length; i++) {
    if (board[destinations.captures[i]] === opponentsColor+'N') {
      return true;
    }
  };

  // Is an opponents king within striking distance?
  destinations = this._getDestinationsForPiece(playerColor[0]+'K', kingSquare, board);
  for (var i=0; i<destinations.captures.length; i++) {
    if (board[destinations.captures[i]] === opponentsColor+'K') {
      return true;
    }
  };

  // Is an opponents rook or queen within striking distance?
  destinations = this._getDestinationsForPiece(playerColor[0]+'R', kingSquare, board);
  for (var i=0; i<destinations.captures.length; i++) {
    if (board[destinations.captures[i]] === opponentsColor+'R' || board[destinations.captures[i]] === opponentsColor+'Q') {
      return true;
    }
  };

  // Is an opponents bishop or queen within striking distance?
  destinations = this._getDestinationsForPiece(playerColor[0]+'B', kingSquare, board);
  for (var i=0; i<destinations.captures.length; i++) {
    if (board[destinations.captures[i]] === opponentsColor+'B' || board[destinations.captures[i]] === opponentsColor+'Q') {
      return true;
    }
  };

  // Safe!
  return false;
};


Game.prototype._isMoveValid = function(move, board) {
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
  return (this._isPlayerInCheck(playerColor, testBoard)) ? false : true ;
};

module.exports = Game;