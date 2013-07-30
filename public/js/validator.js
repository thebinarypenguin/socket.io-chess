(function(window) {

  /* A transformable square object */
  function TransformableSquare(squareString) {

    var file = squareString[0];
    var rank = parseInt(squareString[1], 10);

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

    this.transform = function(x, y) {
      var destFile = alpha2num(file) + x;
      var destRank = rank + y;

      if (destFile < 1 || destFile > 8) { return false; }
      if (destRank < 1 || destRank > 8) { return false; }

      return num2alpha(destFile) + destRank;
    };
  };

  /* The validation library */
  function Validator() {

    /* Black Pawn */
    var getValidMovesForBlackPawn = function(selection) {
      var sq = new TransformableSquare(selection.file+selection.rank);

      var forward = [{ x:+0, y:-1}, { x:+0, y:-2}];
      var capture = [{ x:+1, y:-1}, { x:-1, y:-1}];

      var moves = [];

      // forward
      var m = sq.transform(forward[0].x, forward[0].y);
      if (m !== false) {

        if ($('#'+m).hasClass('empty')) {
          moves.push(m);

          // if pawn not moved AND forward[1] is empty
          // moves.push(m2);
        }
      }

      // capture
      for (var a=0; a<capture.length; a++) {
        var m = sq.transform(capture[a].x, capture[a].y);
        if (m === false) { break }

        var e = $('#'+m);
        if (e.hasClass('white')) { moves.push(m) }
      };

      return moves;
    };

    /* White Pawn */
    var getValidMovesForWhitePawn = function(selection) {
      var sq = new TransformableSquare(selection.file+selection.rank);

      var forward = [{ x:+0, y:+1}, { x:+0, y:+2}];
      var capture = [{ x:+1, y:+1}, { x:-1, y:+1}];

      var moves = [];

      // forward
      var m = sq.transform(forward[0].x, forward[0].y);
      if (m !== false) {

        if ($('#'+m).hasClass('empty')) {
          moves.push(m);

          // if pawn not moved AND forward[1] is empty
          // moves.push(m2);
        }
      }

      // capture
      for (var a=0; a<capture.length; a++) {
        var m = sq.transform(capture[a].x, capture[a].y);
        if (m === false) { break }

        var e = $('#'+m);
        if (e.hasClass('black')) { moves.push(m) }
      };

      return moves;
    };

    /* Rook */
    var getValidMovesForRook = function(selection) {
      var sq = new TransformableSquare(selection.file+selection.rank);
      var transforms = [
        [{ x:+1, y:0}, { x:+2, y:0}, { x:+3, y:0}, { x:+4, y:0}, { x:+5, y:0}, { x:+6, y:0}, { x:+7, y:0}],
        [{ x:0, y:+1}, { x:0, y:+2}, { x:0, y:+3}, { x:0, y:+4}, { x:0, y:+5}, { x:0, y:+6}, { x:0, y:+7}],
        [{ x:-1, y:0}, { x:-2, y:0}, { x:-3, y:0}, { x:-4, y:0}, { x:-5, y:0}, { x:-6, y:0}, { x:-7, y:0}],
        [{ x:0, y:-1}, { x:0, y:-2}, { x:0, y:-3}, { x:0, y:-4}, { x:0, y:-5}, { x:0, y:-6}, { x:0, y:-7}]
      ];
      var moves = [];

      for (var a=0; a<transforms.length; a++) {
        for (var b=0; b<transforms[a].length; b++) {
          var m = sq.transform(transforms[a][b].x, transforms[a][b].y);
          var e = $('#'+m);

          if (m === false) { break }  // TODO move up, all functions

          if (e.hasClass('empty')) {
            moves.push(m);
          } else {
            if ((selection.color === 'b' && e.hasClass('white')) ||
                (selection.color === 'w' && e.hasClass('black'))) {
              moves.push(m)
            }
            break;
          }
        }
      };

      return moves;
    };

    /* Knight */
    var getValidMovesForKnight = function(selection) {
      var sq = new TransformableSquare(selection.file+selection.rank);
      var transforms = [
        {x:-1 , y:+2 },
        {x:+1 , y:+2 },
        {x:+2 , y:+1 },
        {x:+2 , y:-1 },
        {x:+1 , y:-2 },
        {x:-1 , y:-2 },
        {x:-2 , y:-1 },
        {x:-2 , y:+1 }
      ];
      var moves = [];

      for (var a=0; a<transforms.length; a++) {
        var m = sq.transform(transforms[a].x, transforms[a].y);
        var e = $('#'+m);

        if (e.hasClass('empty')) {
          moves.push(m);
        } else {
          if ((selection.color === 'b' && e.hasClass('white')) ||
              (selection.color === 'w' && e.hasClass('black'))) {
            moves.push(m)
          }
        }
      }

      return moves;
    };

    /* Bishop */
    var getValidMovesForBishop = function(selection) {
      var sq = new TransformableSquare(selection.file+selection.rank);
      var transforms = [
        [{ x:+1, y:+1}, { x:+2, y:+2}, { x:+3, y:+3}, { x:+4, y:+4}, { x:+5, y:+5}, { x:+6, y:+6}, { x:+7, y:+7}],
        [{ x:+1, y:-1}, { x:+2, y:-2}, { x:+3, y:-3}, { x:+4, y:-4}, { x:+5, y:-5}, { x:+6, y:-6}, { x:+7, y:-7}],
        [{ x:-1, y:-1}, { x:-2, y:-2}, { x:-3, y:-3}, { x:-4, y:-4}, { x:-5, y:-5}, { x:-6, y:-6}, { x:-7, y:-7}],
        [{ x:-1, y:+1}, { x:-2, y:+2}, { x:-3, y:+3}, { x:-4, y:+4}, { x:-5, y:+5}, { x:-6, y:+6}, { x:-7, y:+7}]
      ];
      var moves = [];

      for (var a=0; a<transforms.length; a++) {
        for (var b=0; b<transforms[a].length; b++) {
          var m = sq.transform(transforms[a][b].x, transforms[a][b].y);
          var e = $('#'+m);

          if (m === false) { break }

          if (e.hasClass('empty')) {
            moves.push(m);
          } else {
            if ((selection.color === 'b' && e.hasClass('white')) ||
                (selection.color === 'w' && e.hasClass('black'))) {
              moves.push(m)
            }
            break;
          }
        }
      };

      return moves;
    };

    /* Queen */
    var getValidMovesForQueen = function(selection) {
      var rook   = getValidMovesForRook(selection);
      var bishop = getValidMovesForBishop(selection);

      return rook.concat(bishop);
    };

    /* King */
    var getValidMovesForKing = function(selection) {
      var sq = new TransformableSquare(selection.file+selection.rank);
      var transforms = [
        {x:0 , y:+1 },
        {x:+1 , y:+1 },
        {x:+1 , y:0 },
        {x:+1 , y:-1 },
        {x:0 , y:-1 },
        {x:-1 , y:-1 },
        {x:-1 , y:0 },
        {x:-1 , y:+1 }
      ];
      var moves = [];

      for (var a=0; a<transforms.length; a++) {
        var m = sq.transform(transforms[a].x, transforms[a].y);
        var e = $('#'+m);

        if (e.hasClass('empty')) {
          moves.push(m);
        } else {
          if ((selection.color === 'b' && e.hasClass('white')) ||
              (selection.color === 'w' && e.hasClass('black'))) {
            moves.push(m)
          }
        }
      }

      return moves;
    };

    /* Get an array of all valid squares */
    this.getValidMoves = function(selection) {
      if (selection.piece === 'P' && selection.color === 'b') { return getValidMovesForBlackPawn(selection); }
      if (selection.piece === 'P' && selection.color === 'w') { return getValidMovesForWhitePawn(selection); }

      if (selection.piece === 'R') { return getValidMovesForRook(selection);   }
      if (selection.piece === 'N') { return getValidMovesForKnight(selection); }
      if (selection.piece === 'B') { return getValidMovesForBishop(selection); }
      if (selection.piece === 'Q') { return getValidMovesForQueen(selection);  }
      if (selection.piece === 'K') { return getValidMovesForKing(selection);   }

      return [];
    };
  };

  window.Client.Validator = new Validator();
}(window));