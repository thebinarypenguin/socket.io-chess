/**
 * Validate input for the game route
 */
var validateGame = function(req) {
  if (!req.session.gameID) { return null; }
  if (!req.params.id) { return null; }
  if (req.session.gameID !== req.params.id) { return null; }

  return {
    gameID : req.session.gameID
  }
};


/**
 * Validate input for the start game route
 */
var validateStartGame = function(req) {
  if (req.body['player-color'] !== 'white' && req.body['player-color'] !== 'black') { return null; }
  if (/^\s*$/.test(req.body['player-name'])) { req.body['player-name'] = 'Player 1'; }

  return {
    playerColor : req.body['player-color'],
    playerName  : req.body['player-name']
  }
};


/**
 * Validate input for the join game route
 */
var validateJoinGame = function(req) {
  if (!req.body['game-id']) { return null; }
  if (/^\s*$/.test(req.body['player-name'])) { req.body['player-name'] = 'Player 2'; }

  return {
    gameID     : req.body['game-id'],
    playerName : req.body['player-name']
  }
};


/**
 * Render "Home" Page
 */
exports.home = function(req, res) {
  res.render('home');
};


/**
 * Render "Game" Page
 */
exports.game = function(req, res) {
  console.log(req.params);
  console.log(req.session);

  var validData = validateGame(req);
  if (validData) {
    res.render('game', {gameID: validData.gameID});
  } else {
    res.redirect('/');
  }
};


/**
 * Handle "Start Game" form submission
 */
exports.startGame = function(req, res) {
  console.log(req.body);

  req.session.regenerate(function(err) {
    if (err) {
      res.redirect('/');
    } else {
      var validData = validateStartGame(req);
      if (validData) {
        req.session.gameID      = 'START_STUB';
        req.session.playerColor = validData.playerColor;
        req.session.playerName  = validData.playerName;
        res.redirect('/game/'+req.session.gameID);
      } else {
        res.redirect('/');
      }
    }
  });
};


/**
 * Handle "Join Game" form submission
 */
exports.joinGame = function(req, res) {
  console.log(req.body);

  req.session.regenerate(function(err) {
    if (err) {
      res.redirect('/');
    } else {
      var validData = validateJoinGame(req);
      if (validData) {
        req.session.gameID     = validData.gameID;
        req.session.playerName = validData.playerName;
        res.redirect('/game/'+req.session.gameID);
      } else {
        res.redirect('/');
      }
    }
  });
};


/**
 * Handle non-existent route requests
 */
exports.invalid = function(req, res) {
  res.redirect('/');
};
