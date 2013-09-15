var _ = require('underscore');

/*
 * The Game object
 */

function Game(params) {

  // pending/ongoing/checkmate/stalemate
  this.status = 'pending';

  this.activePlayer = null;

  this.players = [
    {color: null, name: null, joined: false, inCheck: false},
    {color: null, name: null, joined: false, inCheck: false}
  ];

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

  this.validMoves = [
    { type: 'move', pieceCode: 'wP', startSquare: 'a2', endSquare: 'a3' },
    { type: 'move', pieceCode: 'wP', startSquare: 'a2', endSquare: 'a4' },
    { type: 'move', pieceCode: 'wP', startSquare: 'b2', endSquare: 'b3' },
    { type: 'move', pieceCode: 'wP', startSquare: 'b2', endSquare: 'b4' },
    { type: 'move', pieceCode: 'wP', startSquare: 'c2', endSquare: 'c3' },
    { type: 'move', pieceCode: 'wP', startSquare: 'c2', endSquare: 'c4' },
    { type: 'move', pieceCode: 'wP', startSquare: 'd2', endSquare: 'd3' },
    { type: 'move', pieceCode: 'wP', startSquare: 'd2', endSquare: 'd4' },
    { type: 'move', pieceCode: 'wP', startSquare: 'e2', endSquare: 'e3' },
    { type: 'move', pieceCode: 'wP', startSquare: 'e2', endSquare: 'e4' },
    { type: 'move', pieceCode: 'wP', startSquare: 'f2', endSquare: 'f3' },
    { type: 'move', pieceCode: 'wP', startSquare: 'f2', endSquare: 'f4' },
    { type: 'move', pieceCode: 'wP', startSquare: 'g2', endSquare: 'g3' },
    { type: 'move', pieceCode: 'wP', startSquare: 'g2', endSquare: 'g4' },
    { type: 'move', pieceCode: 'wP', startSquare: 'h2', endSquare: 'h3' },
    { type: 'move', pieceCode: 'wP', startSquare: 'h2', endSquare: 'h4' },
    { type: 'move', pieceCode: 'wN', startSquare: 'b1', endSquare: 'a3' },
    { type: 'move', pieceCode: 'wN', startSquare: 'b1', endSquare: 'c3' },
    { type: 'move', pieceCode: 'wN', startSquare: 'g1', endSquare: 'f3' },
    { type: 'move', pieceCode: 'wN', startSquare: 'g1', endSquare: 'h3' }
  ];

  this.lastMove = null;

  // Set player colors
  if (params.playerColor === 'white') {
    this.players[0].color = 'white';
    this.players[1].color = 'black';
  }

  if (params.playerColor === 'black') {
    this.players[0].color = 'black';
    this.players[1].color = 'white';
  }
}

Game.prototype.addPlayer = function(playerData) {
  // Find player
  var p = _.findWhere(this.players, {color: playerData.playerColor, joined: false});
  if (!p) { return false; }

  // Set player info
  p.name = playerData.playerName;
  p.joined = true;

  // If both players have joined, start the game
  if (this.players[0].joined && this.players[1].joined) {
    this.activePlayer = _.findWhere(this.players, {color: 'white'});
    this.status = 'ongoing';
  }

  return true;
};

Game.prototype.removePlayer = function(playerData) {
  // Find player
  var p = _.findWhere(this.players, {color: playerData.playerColor});
  if (!p) { return false; }

  // Set player info
  p.joined = false;

  return true;
};

Game.prototype.move = function(moveString) {

  // Test move
  var validMove = _.findWhere(this.validMoves, parseMoveString(moveString));
  if (!validMove) { return false; }

  // Apply move
  switch (validMove.type) {
    case 'move' :
      this.board[validMove.endSquare]   = validMove.pieceCode
      this.board[validMove.startSquare] = null;
      break;

    case 'capture' :
      this.capturedPieces.push(this.board[validMove.captureSquare]);
      this.board[validMove.captureSquare] = null;

      this.board[validMove.endSquare]   = validMove.pieceCode
      this.board[validMove.startSquare] = null;
      break;

    case 'castle' :
      // determine long vs short
      // determine black vs white
      // move king and rook
      break;

    default : break;
  };

  this.lastMove = validMove;

  // Set check status for both players
  _.each(this.players, function(p) {
    p.inCheck = isPlayerInCheck(p.color, this.board);
  }, this);

  // Get inactive player
  var inactivePlayer = _.find(this.players, function(p) {
    return (p === this.activePlayer) ? false : true;
  }, this);

  // Regenerate valid moves
  this.validMoves = getMovesForPlayer(inactivePlayer.color, this.board, this.lastMove);

  // Test of checkmate or stalemate
  if (this.validMoves.length === 0) {
    this.status = (inactivePlayer.inCheck) ? 'checkmate' : 'stalemate' ;
  }

  // Toggle active player
  if (this.status === 'ongoing') { this.activePlayer = inactivePlayer; }

  return true;
};

/*
 * Private Utility Functions
 */

var getMovesForPlayer = function(playerColor, board, lastMove) {
  var moves = [];
  var piece, square = null;

  // Loop board
  for (square in board) {
    piece = board[square];

    // Skip empty squares and opponent's pieces
    if (piece === null) { continue; }
    if (piece[0] !== playerColor[0]) { continue; }

    // Collect all moves for all of player's pieces
    switch (piece[1]) {
      case 'P': moves.push.apply(moves, getMovesForPawn(piece, square, board, lastMove)); break;
      case 'R': moves.push.apply(moves, getMovesForRook(piece, square, board)); break;
      case 'N': moves.push.apply(moves, getMovesForKnight(piece, square, board)); break;
      case 'B': moves.push.apply(moves, getMovesForBishop(piece, square, board)); break;
      case 'Q': moves.push.apply(moves, getMovesForQueen(piece, square, board)); break;
      case 'K': moves.push.apply(moves, getMovesForKing(piece, square, board)); break;
    }
  }

  // fixme move into piece specific functions
  moves.forEach(function(m) { m.pieceCode = m.pieceCode.substring(0,2); });

  return moves;
};

var getMovesForPawn = function(piece, square, board, lastMove, includeUnsafe) {
  var moves = [];

  var moveTransforms, captureTransforms = [];

  if (piece[0] === 'w') {
    moveTransforms    = (piece[2] === '_') ? [{x:+0, y:+1}, {x:+0, y:+2}] : [{x:+0, y:+1}];
    captureTransforms = [{x:+1, y:+1}, {x:-1, y:+1}];
  }

  if (piece[0] === 'b') {
    moveTransforms    = (piece[2] === '_') ? [{x:+0, y:-1}, {x:+0, y:-2}] : [{x:+0, y:-1}];
    captureTransforms = [{x:+1, y:-1}, {x:-1, y:-1}];
  }

  var destination, move, capture = null;

  // Loop moves
  for (var i=0; i<moveTransforms.length; i++) {

    // Get destination square for move
    destination = transformSquare(square, moveTransforms[i]);
    if (!destination) { break; }

    // If destination square is empty
    if (board[destination] === null) {
      move = {type: 'move', pieceCode: piece, startSquare: square, endSquare: destination};
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
    // If destination square is occupied
    else {
      break;
    }
  }

  // Loop captures
  for (var i=0; i<captureTransforms.length; i++) {

    // Get destination square for capture
    destination = transformSquare(square, captureTransforms[i]);
    if (!destination) { break; }

    // If destination square is empty
    if (board[destination] === null) {
      // TODO This could be an en passant capture
    }
    // If destination square is occupied by foe
    else if (board[destination][0] !== piece[0]) {
      capture = {type: 'capture', pieceCode: piece, startSquare: square, endSquare: destination, captureSquare: destination};
      if (includeUnsafe || isMoveSafe(capture, board)) { moves.push(capture); }
    }
    // If destination square is occupied by friend
    else {
      // Do nothing
    }
  }

  return moves;
};

var getMovesForRook = function(piece, square, board, includeUnsafe) {
  var moves = [];

  var transforms = {
    n: [{x:0, y:+1}, {x:0, y:+2}, {x:0, y:+3}, {x:0, y:+4}, {x:0, y:+5}, {x:0, y:+6}, {x:0, y:+7}],
    e: [{x:+1, y:0}, {x:+2, y:0}, {x:+3, y:0}, {x:+4, y:0}, {x:+5, y:0}, {x:+6, y:0}, {x:+7, y:0}],
    s: [{x:0, y:-1}, {x:0, y:-2}, {x:0, y:-3}, {x:0, y:-4}, {x:0, y:-5}, {x:0, y:-6}, {x:0, y:-7}],
    w: [{x:-1, y:0}, {x:-2, y:0}, {x:-3, y:0}, {x:-4, y:0}, {x:-5, y:0}, {x:-6, y:0}, {x:-7, y:0}]
  };

  var destination, move = null;

  // Loop all moves
  for (var group in transforms) {
    for (var i=0; i<transforms[group].length; i++) {

      // Get destination square for move
      destination = transformSquare(square, transforms[group][i]);
      if (!destination) { break; }

      // If destination square is empty
      if (board[destination] === null) {
        move = {type: 'move', pieceCode: piece, startSquare: square, endSquare: destination};
        if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
      }
      // If destination square is occupied by foe
      else if (board[destination][0] !== piece[0]) {
        move = {type: 'capture', pieceCode: piece, startSquare: square, endSquare: destination, captureSquare: destination};
        if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
        break;
      }
      // If destination square is occupied by friend
      else {
        break;
      }
    }
  }

  return moves;
};

var getMovesForKnight = function(piece, square, board, includeUnsafe) {
  var moves = [];

  var transforms = [
    {x:+1, y:+2},
    {x:+2, y:+1},
    {x:+2, y:-1},
    {x:+1, y:-2},
    {x:-1, y:-2},
    {x:-2, y:-1},
    {x:-2, y:+1},
    {x:-1, y:+2}
  ];

  var destination, move = null;

  // Loop all moves
  for (var i=0; i<transforms.length; i++) {

    // Get destination square for move
    destination = transformSquare(square, transforms[i]);
    if (!destination) { continue; }

    // If destination square is empty
    if (board[destination] === null) {
      move = {type: 'move', pieceCode: piece, startSquare: square, endSquare: destination};
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
    // If destination square is occupied by foe
    else if (board[destination][0] !== piece[0]) {
      move = {type: 'capture', pieceCode: piece, startSquare: square, endSquare: destination, captureSquare: destination};
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
    // If destination square is occupied by friend
    else {
      // Do nothing
    }
  }

  return moves;
};

var getMovesForBishop = function(piece, square, board, includeUnsafe) {
  var moves = [];

  var transforms = {
    ne: [{x:+1, y:+1}, {x:+2, y:+2}, {x:+3, y:+3}, {x:+4, y:+4}, {x:+5, y:+5}, {x:+6, y:+6}, {x:+7, y:+7}],
    se: [{x:+1, y:-1}, {x:+2, y:-2}, {x:+3, y:-3}, {x:+4, y:-4}, {x:+5, y:-5}, {x:+6, y:-6}, {x:+7, y:-7}],
    sw: [{x:-1, y:-1}, {x:-2, y:-2}, {x:-3, y:-3}, {x:-4, y:-4}, {x:-5, y:-5}, {x:-6, y:-6}, {x:-7, y:-7}],
    nw: [{x:-1, y:+1}, {x:-2, y:+2}, {x:-3, y:+3}, {x:-4, y:+4}, {x:-5, y:+5}, {x:-6, y:+6}, {x:-7, y:+7}]
  };

  var destination, move = null;

  // Loop all moves
  for (var group in transforms) {
    for (var i=0; i<transforms[group].length; i++) {

      // Get destination square for move
      destination = transformSquare(square, transforms[group][i]);
      if (!destination) { break; }

      // If destination square is empty
      if (board[destination] === null) {
        move = {type: 'move', pieceCode: piece, startSquare: square, endSquare: destination};
        if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
      }
      // If destination square is occupied by foe
      else if (board[destination][0] !== piece[0]) {
        move = {type: 'capture', pieceCode: piece, startSquare: square, endSquare: destination, captureSquare: destination};
        if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
        break;
      }
      // If destination square is occupied by friend
      else {
        break;
      }
    }
  }

  return moves;
};

var getMovesForQueen = function(piece, square, board, includeUnsafe) {
  var moves = [];

  var transforms = {
    n:  [{x:+0, y:+1}, {x:+0, y:+2}, {x:+0, y:+3}, {x:+0, y:+4}, {x:+0, y:+5}, {x:+0, y:+6}, {x:+0, y:+7}],
    ne: [{x:+1, y:+1}, {x:+2, y:+2}, {x:+3, y:+3}, {x:+4, y:+4}, {x:+5, y:+5}, {x:+6, y:+6}, {x:+7, y:+7}],
    e:  [{x:+1, y:+0}, {x:+2, y:+0}, {x:+3, y:+0}, {x:+4, y:+0}, {x:+5, y:+0}, {x:+6, y:+0}, {x:+7, y:+0}],
    se: [{x:+1, y:-1}, {x:+2, y:-2}, {x:+3, y:-3}, {x:+4, y:-4}, {x:+5, y:-5}, {x:+6, y:-6}, {x:+7, y:-7}],
    s:  [{x:+0, y:-1}, {x:+0, y:-2}, {x:+0, y:-3}, {x:+0, y:-4}, {x:+0, y:-5}, {x:+0, y:-6}, {x:+0, y:-7}],
    sw: [{x:-1, y:-1}, {x:-2, y:-2}, {x:-3, y:-3}, {x:-4, y:-4}, {x:-5, y:-5}, {x:-6, y:-6}, {x:-7, y:-7}],
    w:  [{x:-1, y:+0}, {x:-2, y:+0}, {x:-3, y:+0}, {x:-4, y:+0}, {x:-5, y:+0}, {x:-6, y:+0}, {x:-7, y:+0}],
    nw: [{x:-1, y:+1}, {x:-2, y:+2}, {x:-3, y:+3}, {x:-4, y:+4}, {x:-5, y:+5}, {x:-6, y:+6}, {x:-7, y:+7}]
  };

  var destination, move = null;

  // Loop all moves
  for (var group in transforms) {
    for (var i=0; i<transforms[group].length; i++) {

      // Get destination square for move
      destination = transformSquare(square, transforms[group][i]);
      if (!destination) { break; }

      // If destination square is empty
      if (board[destination] === null) {
        move = {type: 'move', pieceCode: piece, startSquare: square, endSquare: destination};
        if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
      }
      // If destination square is occupied by foe
      else if (board[destination][0] !== piece[0]) {
        move = {type: 'capture', pieceCode: piece, startSquare: square, endSquare: destination, captureSquare: destination};
        if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
        break;
      }
      // If destination square is occupied by friend
      else {
        break;
      }
    }
  }

  return moves;
};

var getMovesForKing = function(piece, square, board, includeUnsafe) {
  var moves = [];

  var transforms = [
    {x:+0, y:+1},
    {x:+1, y:+1},
    {x:+1, y:+0},
    {x:+1, y:-1},
    {x:+0, y:-1},
    {x:-1, y:-1},
    {x:-1, y:+0},
    {x:-1, y:+1}
  ];

  // FIXME does not handle castling yet

  var destination, move = null;

  // Loop all moves
  for (var i=0; i<transforms.length; i++) {

    // Get destination square for move
    destination = transformSquare(square, transforms[i]);
    if (!destination) { continue; }

    // If destination square is empty
    if (board[destination] === null) {
      move = {type: 'move', pieceCode: piece, startSquare: square, endSquare: destination};
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
    // If destination square is occupied by foe
    else if (board[destination][0] !== piece[0]) {
      move = {type: 'capture', pieceCode: piece, startSquare: square, endSquare: destination, captureSquare: destination};
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
    // If destination square is occupied by friend
    else {
      // Do nothing
    }
  }

  return moves;
};

var isPlayerInCheck = function(playerColor, board) {
  var opponentColor = null;
  var kingSquare    = null;
  var moves         = [];

  // Set player and opponent color
  if (playerColor === 'white') {
    playerColor   = 'w';
    opponentColor = 'b';
  }
  if (playerColor === 'black') {
    playerColor   = 'b';
    opponentColor = 'w';
  }

  // Determine king square
  for (var sq in board) {
    if (board[sq] && board[sq].substring(0,2) === playerColor+'K') {
      kingSquare = sq;
      break;
    }
  }

  // Test if king is threatened by opponents pawn
  moves = getMovesForPawn(playerColor+'P', kingSquare, board, null, true);
  for (var i=0; i<moves.length; i++) {
    if (moves[i].type === 'capture' && board[moves[i].captureSquare] === opponentColor+'P') {
      return true;
    }
  }

  // Test if king is threatened by opponents rook
  moves = getMovesForRook(playerColor+'R', kingSquare, board, true);
  for (var i=0; i<moves.length; i++) {
    if (moves[i].type === 'capture' && board[moves[i].captureSquare] === opponentColor+'R') {
      return true;
    }
  }

  // Test if king is threatened by opponents knight
  moves = getMovesForKnight(playerColor+'N', kingSquare, board, true);
  for (var i=0; i<moves.length; i++) {
    if (moves[i].type === 'capture' && board[moves[i].captureSquare] === opponentColor+'N') {
      return true;
    }
  }

  // Test if king is threatened by opponents bishop
  moves = getMovesForBishop(playerColor+'B', kingSquare, board, true);
  for (var i=0; i<moves.length; i++) {
    if (moves[i].type === 'capture' && board[moves[i].captureSquare] === opponentColor+'B') {
      return true;
    }
  }

  // Test if king is threatened by opponents queen
  moves = getMovesForQueen(playerColor+'Q', kingSquare, board, true);
  for (var i=0; i<moves.length; i++) {
    if (moves[i].type === 'capture' && board[moves[i].captureSquare] === opponentColor+'Q') {
      return true;
    }
  }

  // Test if king is threatened by opponents king
  moves = getMovesForKing(playerColor+'K', kingSquare, board, true);
  for (var i=0; i<moves.length; i++) {
    if (moves[i].type === 'capture' && board[moves[i].captureSquare] === opponentColor+'K') {
      return true;
    }
  }

  return false;
};

var isMoveSafe = function(move, board) {
  var testBoard   = {};
  var playerColor = null;

  // Set player color
  if (move.pieceCode[0] === 'w') { playerColor = 'white'; }
  if (move.pieceCode[0] === 'b') { playerColor = 'black'; }

  // Create a local copy of the board to test against
  for (prop in board) {
    testBoard[prop] = board[prop];
  }

  // Apply move to test board
  if (move.type === 'capture') {
    testBoard[move.captureSquare] = null;
  }
  testBoard[move.endSquare]   = move.pieceCode;
  testBoard[move.startSquare] = null;

  // If player is in check then this is an unsafe move
  return (isPlayerInCheck(playerColor, testBoard)) ? false : true ;
};

var transformSquare = function(square, transform) {
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

  // Parse square
  var file = square[0];
  var rank = parseInt(square[1], 10);

  // Apply transform
  var destFile = alpha2num(file) + transform.x;
  var destRank = rank + transform.y;

  // Check boundaries
  if (destFile < 1 || destFile > 8) { return false; }
  if (destRank < 1 || destRank > 8) { return false; }

  // Return new square
  return num2alpha(destFile) + destRank;
};

var parseMoveString = function(moveString) {

  if (moveString === 'wK0-0')   { return {type: 'castle', pieceCode: 'wK', boardSide: 'king'};  }
  if (moveString === 'bK0-0')   { return {type: 'castle', pieceCode: 'bK', boardSide: 'king'};  }
  if (moveString === 'wK0-0-0') { return {type: 'castle', pieceCode: 'wK', boardSide: 'queen'}; }
  if (moveString === 'bK0-0-0') { return {type: 'castle', pieceCode: 'bK', boardSide: 'queen'}; }

  if (moveString[4] === '-') {
    return {
      type        : 'move',
      pieceCode   : moveString.substring(0, 2),
      startSquare : moveString.substring(2, 4),
      endSquare   : moveString.substring(5, 7)
    }
  } else if (moveString[4] === 'x') {
    return {
      type          : 'capture',
      pieceCode     : moveString.substring(0, 2),
      startSquare   : moveString.substring(2, 4),
      endSquare     : moveString.substring(5, 7),
      captureSquare : moveString.substring(5, 7)
    }
  } else {
    return null;
  }
};

module.exports = Game;