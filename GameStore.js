var Game = require('./Game');

function GameStore() {
  this.games = {};
};

GameStore.prototype.add = function(gameParams) {
  var key       = '';
  var keyLength = 7;
  var chars     = 'abcdefghijklmnopqrstuvwxyz0123456789';

  // Generate a key until we get a unique one
  do {
    for (var i=0; i<keyLength; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    };
  } while (this.games.hasOwnProperty(key))

  // Create a new game and save using key
  this.games[key] = new Game(gameParams);

  return key;
};

GameStore.prototype.remove = function(key) {
  if (this.games.hasOwnProperty(key)) {
    delete this.games[key];
    return true;
  } else {
    return false;
  }
};

GameStore.prototype.contains = function(key) {
  return (this.games.hasOwnProperty(key)) ? true : false;
};

GameStore.prototype.find = function(key) {
  if (this.games.hasOwnProperty(key)) {
    return this.games[key];
  } else {
    return false;
  }
};

module.exports = GameStore;
