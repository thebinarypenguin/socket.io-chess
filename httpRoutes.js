var DB = null;

/**
 * Validate session data for the game page
 */
var validateGame = function(req) {
  // These must exist
  if (!req.session.gameID)      { return null; }
  if (!req.session.playerColor) { return null; }
  if (!req.session.playerName)  { return null; }
  if (!req.params.id)           { return null; }

  // These must match
  if (req.session.gameID !== req.params.id) { return null; }

  return {
    gameID      : req.session.gameID,
    playerColor : req.session.playerColor,
    playerName  : req.session.playerName
  }
};

/**
 * Validate "Start Game" form input
 */
var validateStartGame = function(req) {
  // These must exist
  if (!req.body['player-color']) { return null; }

  // Player Color must be 'white' or 'black'
  if (req.body['player-color'] !== 'white' && req.body['player-color'] !== 'black') { return null; }

  // If Player Name consists only of whitespace, set as 'Player 1'
  if (/^\s*$/.test(req.body['player-name'])) { req.body['player-name'] = 'Player 1'; }

  return {
    playerColor : req.body['player-color'],
    playerName  : req.body['player-name']
  }
};

/**
 * Validate "Join Game" form input
 */
var validateJoinGame = function(req) {
  // These must exist
  if (!req.body['game-id']) { return null; }

  // If Game ID consists of only whitespace, return null
  if (/^\s*$/.test(req.body['game-id'])) { return null; }

  // If Player Name consists only of whitespace, set as 'Player 2'
  if (/^\s*$/.test(req.body['player-name'])) { req.body['player-name'] = 'Player 2'; }

  return {
    gameID      : req.body['game-id'],
    playerName  : req.body['player-name']
  }
};

/**
 * Render "Home" Page
 */
var home = function(req, res) {
  res.render('home');
};

/**
 * Render "Game" Page
 */
var game = function(req, res) {
  var validData = validateGame(req);
  if (!validData) { res.redirect('/'); return; }

  res.render('game', validData);
};

/**
 * Handle "Start Game" form submission
 */
var startGame = function(req, res) {
  req.session.regenerate(function(err) {
    if (err) { res.redirect('/'); return; }

    var validData = validateStartGame(req);
    if (!validData) { res.redirect('/'); return; }

    var gameID = DB.add(validData);

    req.session.gameID      = gameID;
    req.session.playerColor = validData.playerColor;
    req.session.playerName  = validData.playerName;

    res.redirect('/game/'+gameID);
  });
};

/**
 * Handle "Join Game" form submission
 */
var joinGame = function(req, res) {
  req.session.regenerate(function(err) {
    if (err) { res.redirect('/'); return; }

    var validData = validateJoinGame(req);
    if (!validData) { res.redirect('/'); return; }

    var game = DB.find(validData.gameID);
    if (!game) { res.redirect('/'); return;}

    req.session.gameID      = validData.gameID;
    req.session.playerColor = game.players[1].color;
    req.session.playerName  = validData.playerName;

    res.redirect('/game/'+validData.gameID);
  });
};

/**
 * Handle non-existent route requests
 */
var invalid = function(req, res) {
  res.redirect('/');
};

/**
 * Attach route handlers to the app
 */
exports.attach = function(app, db) {
  DB = db;

  app.get('/',         home);
  app.get('/game/:id', game);
  app.post('/start',   startGame);
  app.post('/join',    joinGame);
  app.all('*',         invalid);
};
