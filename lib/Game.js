var _ = require('underscore');

/*
 * The Game object
 */

/**
 * Create new game and initialize
 */
function Game(params) {

  // pending/ongoing/checkmate/stalemate/forfeit
  this.status = 'pending';

  this.activePlayer = null;

  this.players = [
    {color: null, name: null, joined: false, inCheck: false, forfeited: false},
    {color: null, name: null, joined: false, inCheck: false, forfeited: false}
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

  this.modifiedOn = Date.now();

  // Set player colors
  // params.playerColor is the color of the player who created the game
  if (params.playerColor === 'white') {
    this.players[0].color = 'white';
    this.players[1].color = 'black';
  }
  else if (params.playerColor === 'black') {
    this.players[0].color = 'black';
    this.players[1].color = 'white';
  }
}

/**
 * Add player to game, and after both players have joined activate the game.
 * Returns true on success and false on failure.
 */
Game.prototype.addPlayer = function(playerData) {

  // Check for an open spot
  var p = _.findWhere(this.players, {color: playerData.playerColor, joined: false});
  if (!p) { return false; }

  // Set player info
  p.name = playerData.playerName;
  p.joined = true;

  // If both players have joined, start the game
  if (this.players[0].joined && this.players[1].joined && this.status === 'pending') {
    this.activePlayer = _.findWhere(this.players, {color: 'white'});
    this.status = 'ongoing';
  }

  this.modifiedOn = Date.now();

  return true;
};

/**
 * Remove player from game, this does not end the game, players may come and go as they please.
 * Returns true on success and false on failure.
 */
Game.prototype.removePlayer = function(playerData) {

  // Find player in question
  var p = _.findWhere(this.players, {color: playerData.playerColor});
  if (!p) { return false; }

  // Set player info
  p.joined = false;

  this.modifiedOn = Date.now();

  return true;
};

/**
 * Apply move and regenerate game state.
 * Returns true on success and false on failure.
 */
Game.prototype.move = function(moveString) {

  // Test if move is valid
  var validMove = _.findWhere(this.validMoves, parseMoveString(moveString));
  if (!validMove) { return false; }

  // Check for a pawn promotion suffix
  var whitePawnPromotion = new RegExp('(w)P..[-x].8p([RNBQ])');
  var blackPawnPromotion = new RegExp('(b)P..[-x].1p([RNBQ])');
  var promotionMatches, promotionPiece = null;

  if (whitePawnPromotion.test(moveString)) {
    promotionMatches = whitePawnPromotion.exec(moveString);
    promotionPiece   = promotionMatches[1]+promotionMatches[2];
  }

  if (blackPawnPromotion.test(moveString)) {
    promotionMatches = blackPawnPromotion.exec(moveString);
    promotionPiece   = promotionMatches[1]+promotionMatches[2];
  }

  // Apply move
  switch (validMove.type) {
    case 'move' :
      this.board[validMove.endSquare] = promotionPiece || validMove.pieceCode;
      this.board[validMove.startSquare] = null;
      break;

    case 'capture' :
      this.capturedPieces.push(this.board[validMove.captureSquare]);
      this.board[validMove.captureSquare] = null;

      this.board[validMove.endSquare] = promotionPiece || validMove.pieceCode;
      this.board[validMove.startSquare] = null;
      break;

    case 'castle' :
      if (validMove.pieceCode === 'wK' && validMove.boardSide === 'queen') {
        this.board.c1 = validMove.pieceCode
        this.board.e1 = null;

        this.board.d1 = 'wR'
        this.board.a1 = null;
      }
      if (validMove.pieceCode === 'wK' && validMove.boardSide === 'king') {
        this.board.g1 = validMove.pieceCode
        this.board.e1 = null;

        this.board.f1 = 'wR'
        this.board.h1 = null;
      }
      if (validMove.pieceCode === 'bK' && validMove.boardSide === 'queen') {
        this.board.c8 = validMove.pieceCode
        this.board.e8 = null;

        this.board.d8 = 'bR'
        this.board.a8 = null;
      }
      if (validMove.pieceCode === 'bK' && validMove.boardSide === 'king') {
        this.board.g8 = validMove.pieceCode
        this.board.e8 = null;

        this.board.f8 = 'bR'
        this.board.h8 = null;
      }
      break;

    default : break;
  };

  // Set this move as last move
  this.lastMove = validMove;

  // Get inactive player
  var inactivePlayer = _.find(this.players, function(p) {
    return (p === this.activePlayer) ? false : true;
  }, this);

  // Regenerate valid moves
  this.validMoves = getMovesForPlayer(inactivePlayer.color, this.board, this.lastMove);

  // Set check status for both players
  _.each(this.players, function(p) {
    p.inCheck = isPlayerInCheck(p.color, this.board);
  }, this);

  // Test for checkmate or stalemate
  if (this.validMoves.length === 0) {
    this.status = (inactivePlayer.inCheck) ? 'checkmate' : 'stalemate' ;
  }

  // Toggle active player
  if (this.status === 'ongoing') { this.activePlayer = inactivePlayer; }

  this.modifiedOn = Date.now();

  return true;
};

/**
 * Apply a player's forfeit to the game.
 * Returns true on success and false on failure.
 */
Game.prototype.forfeit = function(playerData) {

  // Find player in question
  var p = _.findWhere(this.players, {color: playerData.playerColor});
  if (!p) { return false; }

  // Set player info
  p.forfeited = true;

  // Set game status
  this.status = 'forfeit';

  this.modifiedOn = Date.now();

  return true;
};

/*
 * Private Utility Functions
 */

/**
 * Get all the valid/safe moves a player can make.
 * Returns an array of move objects on success or an empty array on failure.
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

  return moves;
};

/**
 * Get all the moves a pawn can make.
 * If includeUnsafe is true then moves that put the player's own king in check will be included.
 * Returns an array of move objects on success or an empty array on failure.
 */
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
      move = {type: 'move', pieceCode: piece.substring(0,2), startSquare: square, endSquare: destination};
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
    if (!destination) { continue; }

    // If destination square is empty
    if (board[destination] === null) {

      // Get prerequisite move for a valid en passant capture
      if (piece[0] === 'w') {
        epPreReq = {
          type        : 'move',
          pieceCode   : 'bP',
          startSquare : destination[0] + '7',
          endSquare   : destination[0] + square[1]
        };
      }
      if (piece[0] === 'b') {
        epPreReq = {
          type        : 'move',
          pieceCode   : 'wP',
          startSquare : destination[0]+'2',
          endSquare   : destination[0] + square[1]
        };
      }

      // If last move matches the prerequisite, then we have a valid en passant capture
      if (_.isEqual(lastMove, epPreReq)) {
        capture = {
          type          : 'capture',
          pieceCode     : piece.substring(0,2),
          startSquare   : square,
          endSquare     : destination,
          captureSquare : destination[0]+square[1]
        };
        if (includeUnsafe || isMoveSafe(capture, board)) { moves.push(capture); }
      }
    }
    // If destination square is occupied by foe
    else if (board[destination][0] !== piece[0]) {
      capture = {
        type          : 'capture',
        pieceCode     : piece.substring(0,2),
        startSquare   : square,
        endSquare     : destination,
        captureSquare : destination
      };
      if (includeUnsafe || isMoveSafe(capture, board)) { moves.push(capture); }
    }
    // If destination square is occupied by friend
    else {
      // Do nothing
    }
  }

  return moves;
};

/**
 * Get all the moves a rook can make.
 * If includeUnsafe is true then moves that put the player's own king in check will be included.
 * Returns an array of move objects on success or an empty array on failure.
 */
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
        move = {
          type        : 'move',
          pieceCode   : piece.substring(0,2),
          startSquare : square,
          endSquare   : destination
        };
        if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
      }
      // If destination square is occupied by foe
      else if (board[destination][0] !== piece[0]) {
        move = {
          type          : 'capture',
          pieceCode     : piece.substring(0,2),
          startSquare   : square,
          endSquare     : destination,
          captureSquare : destination
        };
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

/**
 * Get all the moves a knight can make.
 * If includeUnsafe is true then moves that put the player's own king in check will be included.
 * Returns an array of move objects on success or an empty array on failure.
 */
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
      move = {
        type        : 'move',
        pieceCode   : piece.substring(0,2),
        startSquare : square,
        endSquare   : destination
      };
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
    // If destination square is occupied by foe
    else if (board[destination][0] !== piece[0]) {
      move = {
        type          : 'capture',
        pieceCode     : piece.substring(0,2),
        startSquare   : square,
        endSquare     : destination,
        captureSquare : destination
      };
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
    // If destination square is occupied by friend
    else {
      // Do nothing
    }
  }

  return moves;
};

/**
 * Get all the moves a bishop can make.
 * If includeUnsafe is true then moves that put the player's own king in check will be included.
 * Returns an array of move objects on success or an empty array on failure.
 */
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
        move = {
          type        : 'move',
          pieceCode   : piece.substring(0,2),
          startSquare : square,
          endSquare   : destination
        };
        if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
      }
      // If destination square is occupied by foe
      else if (board[destination][0] !== piece[0]) {
        move = {
          type          : 'capture',
          pieceCode     : piece.substring(0,2),
          startSquare   : square,
          endSquare     : destination,
          captureSquare : destination
        };
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

/**
 * Get all the moves a queen can make.
 * If includeUnsafe is true then moves that put the player's own king in check will be included.
 * Returns an array of move objects on success or an empty array on failure.
 */
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
        move = {
          type        : 'move',
          pieceCode   : piece.substring(0,2),
          startSquare : square,
          endSquare   : destination
        };
        if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
      }
      // If destination square is occupied by foe
      else if (board[destination][0] !== piece[0]) {
        move = {
          type          : 'capture',
          pieceCode     : piece.substring(0,2),
          startSquare   : square,
          endSquare     : destination,
          captureSquare : destination
        };
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

/**
 * Get all the safe moves a king can make.
 * Returns an array of move objects on success or an empty array on failure.
 */
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

  var destination, move = null;

  // Loop all moves
  for (var i=0; i<transforms.length; i++) {

    // Get destination square for move
    destination = transformSquare(square, transforms[i]);
    if (!destination) { continue; }

    // If destination square is empty
    if (board[destination] === null) {
      move = {
        type        : 'move',
        pieceCode   : piece.substring(0,2),
        startSquare : square,
        endSquare   : destination
      };
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
    // If destination square is occupied by foe
    else if (board[destination][0] !== piece[0]) {
      move = {
        type          : 'capture',
        pieceCode     : piece.substring(0,2),
        startSquare   : square,
        endSquare     : destination,
        captureSquare : destination
      };
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
    // If destination square is occupied by friend
    else {
      // Do nothing
    }
  }

  // Check for castling moves

  if (piece[0] === 'w') {
    if (board.e1 === 'wK_' && board.h1 === 'wR_' && board.f1 === null && board.g1 === null) {
      move = {
        type: 'castle',
        pieceCode: 'wK',
        boardSide: 'king'
      };
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
    if (board.e1 === 'wK_' && board.a1 === 'wR_' && board.b1 === null && board.c1 === null && board.d1 === null) {
      move = {
        type: 'castle',
        pieceCode: 'wK',
        boardSide: 'queen'
      };
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
  }

  if (piece[0] === 'b') {
    if (board.e8 === 'bK_' && board.h8 === 'bR_' && board.f8 === null && board.g8 === null) {
      move = {
        type: 'castle',
        pieceCode: 'bK',
        boardSide: 'king'
      };
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
    if (board.e8 === 'bK_' && board.a8 === 'bR_' && board.b8 === null && board.c8 === null && board.d8 === null) {
      move = {
        type: 'castle',
        pieceCode: 'bK',
        boardSide: 'queen'
      };
      if (includeUnsafe || isMoveSafe(move, board)) { moves.push(move); }
    }
  }

  return moves;
};

/**
 * Determine if a player's king is in check or not.
 * Returns true or false.
 */
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
    if (moves[i].type === 'capture' && board[moves[i].captureSquare].substring(0,2) === opponentColor+'P') {
      return true;
    }
  }

  // Test if king is threatened by opponents rook
  moves = getMovesForRook(playerColor+'R', kingSquare, board, true);
  for (var i=0; i<moves.length; i++) {
    if (moves[i].type === 'capture' && board[moves[i].captureSquare].substring(0,2) === opponentColor+'R') {
      return true;
    }
  }

  // Test if king is threatened by opponents knight
  moves = getMovesForKnight(playerColor+'N', kingSquare, board, true);
  for (var i=0; i<moves.length; i++) {
    if (moves[i].type === 'capture' && board[moves[i].captureSquare].substring(0,2) === opponentColor+'N') {
      return true;
    }
  }

  // Test if king is threatened by opponents bishop
  moves = getMovesForBishop(playerColor+'B', kingSquare, board, true);
  for (var i=0; i<moves.length; i++) {
    if (moves[i].type === 'capture' && board[moves[i].captureSquare].substring(0,2) === opponentColor+'B') {
      return true;
    }
  }

  // Test if king is threatened by opponents queen
  moves = getMovesForQueen(playerColor+'Q', kingSquare, board, true);
  for (var i=0; i<moves.length; i++) {
    if (moves[i].type === 'capture' && board[moves[i].captureSquare].substring(0,2) === opponentColor+'Q') {
      return true;
    }
  }

  // Test if king is threatened by opponents king
  moves = getMovesForKing(playerColor+'K', kingSquare, board, true);
  for (var i=0; i<moves.length; i++) {
    if (moves[i].type === 'capture' && board[moves[i].captureSquare].substring(0,2) === opponentColor+'K') {
      return true;
    }
  }

  return false;
};

/**
 * Determine if a move is safe (i.e. it won't put the player's own king in check)
 * Returns true or false.
 */
var isMoveSafe = function(move, board) {
  var testBoard   = {};
  var playerColor = null;

  // Set player color
  if (move.pieceCode[0] === 'w') { playerColor = 'white'; }
  if (move.pieceCode[0] === 'b') { playerColor = 'black'; }

  // Create a local copy of the board to test against
  for (prop in board) { testBoard[prop] = board[prop]; }

  // Moves
  if (move.type === 'move') {
    testBoard[move.endSquare]   = move.pieceCode;
    testBoard[move.startSquare] = null;

    return (isPlayerInCheck(playerColor, testBoard)) ? false : true ;
  }

  // Captures
  if (move.type === 'capture') {
    testBoard[move.captureSquare] = null;
    testBoard[move.endSquare]     = move.pieceCode;
    testBoard[move.startSquare]   = null;

    return (isPlayerInCheck(playerColor, testBoard)) ? false : true ;
  }

  // Castles
  if (move.type === 'castle') {
    var kingSquare, rookSquare = null;
    var kingTravelSquares      = [];
    var castleTestBoard        = {};

    if (playerColor === 'white') {
      kingSquare = 'e1';
      if (move.boardSide === 'king') {
        rookSquare        = 'h1';
        kingTravelSquares = ['f1', 'g1'];
      }
      if (move.boardSide === 'queen') {
        rookSquare        = 'a1';
        kingTravelSquares = ['d1', 'c1'];
      }
    }

    if (playerColor === 'black') {
      kingSquare = 'e8';
      if (move.boardSide === 'king') {
        rookSquare        = 'h8';
        kingTravelSquares = ['f8', 'g8'];
      }
      if (move.boardSide === 'queen') {
        rookSquare        = 'a8';
        kingTravelSquares = ['d8', 'c8'];
      }
    }

    // If king already in check
    if (isPlayerInCheck(playerColor, testBoard)) { return false; }

    // If king passes through check
    for (var i=0; i<kingTravelSquares.length; i++) {
      castleTestBoard = testBoard;

      // Move king
      castleTestBoard[kingTravelSquares[i]] = move.pieceCode;
      castleTestBoard[kingSquare]           = null;

      // Test for check
      if (isPlayerInCheck(playerColor, castleTestBoard)) { return false; }
    }

    // Move king
    testBoard[kingTravelSquares[1]] = move.pieceCode;
    testBoard[kingSquare]           = null;

    // Move rook
    testBoard[kingTravelSquares[0]] = playerColor[0]+'R';
    testBoard[rookSquare]           = null;

    // If king ends up in check
    return (isPlayerInCheck(playerColor, testBoard)) ? false : true ;
  }

  return false;
};

/**
 * Apply an x and y offset to a starting square to get a destination square.
 * Returns the destination square on success or false on failure.
 */
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

/**
 * Parse a move string and convert it to an object.
 * Returns the move object on success or null on failure.
 */
var parseMoveString = function(moveString) {

  // Castles
  if (moveString === 'wK0-0')   { return {type: 'castle', pieceCode: 'wK', boardSide: 'king'};  }
  if (moveString === 'bK0-0')   { return {type: 'castle', pieceCode: 'bK', boardSide: 'king'};  }
  if (moveString === 'wK0-0-0') { return {type: 'castle', pieceCode: 'wK', boardSide: 'queen'}; }
  if (moveString === 'bK0-0-0') { return {type: 'castle', pieceCode: 'bK', boardSide: 'queen'}; }

  // En Passant Captures
  if (moveString[1] === 'P' && moveString[4] === 'x' && moveString.slice(-2) === 'ep') {
    return {
      type          : 'capture',
      pieceCode     : moveString.substring(0, 2),
      startSquare   : moveString.substring(2, 4),
      endSquare     : moveString.substring(5, 7),
      captureSquare : moveString[5] + moveString[3]
    }
  }

  // Moves
  if (moveString[4] === '-') {
    return {
      type        : 'move',
      pieceCode   : moveString.substring(0, 2),
      startSquare : moveString.substring(2, 4),
      endSquare   : moveString.substring(5, 7)
    }
  }
  // Captures
  else if (moveString[4] === 'x') {
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

// Export the game object
module.exports = Game;