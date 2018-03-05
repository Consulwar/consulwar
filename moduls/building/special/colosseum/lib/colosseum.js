let Colosseum;
if (Meteor.isClient) {
  Colosseum = require('/imports/content/Building/Residential/client/Colosseum').default;
} else {
  Colosseum = require('/imports/content/Building/Residential/server/Colosseum').default;
}

initBuildingSpecialColosseumLib = function() {
'use strict';

game.ColosseumTournament = function(options) {
  // New-to-legacy
  const idParts = options.id.split('/');
  options.name = options.title;
  options.engName = idParts[idParts.length - 1].toLocaleLowerCase();

  if (Game.newToLegacyNames[options.engName]) {
    options.engName = Game.newToLegacyNames[options.engName];
  }

  if (options.drop) {
    this._drop = options.drop;
    options.drop = [];
    this._drop.forEach((drop) => {
      let profit = { resources: {} };
      _(drop.profit).keys().forEach((profitId) => {
        const idParts = profitId.split('/');
        let engName = idParts[idParts.length - 1].toLocaleLowerCase();
        if (['metal', 'crystal'].indexOf(engName) !== -1) {
          engName += 's';
        } else if (Game.newToLegacyNames[engName]) {
          engName = Game.newToLegacyNames[engName];
        }
        profit.resources[engName] = drop.profit[profitId];
      });
      options.drop.push({
        chance: drop.chance,
        profit,
      });
    })
  }
  //

  if (Game.Building.special.Colosseum.tournaments[options.engName]) {
    throw new Meteor.Error('Ошибка в контенте', 'Дублируется турнир ' + options.engName);
  }

  Game.Building.special.Colosseum.tournaments[options.engName] = this;

  this.engName = options.engName;
  this.name = options.name;
  this.description = options.description;
  this.level = options.level;
  this.price = options.price;
  this.drop = options.drop;

  this.checkLevel = function() {
    return Colosseum.getCurrentLevel() >= this.level;
  };

  this.checkPrice = function() {
    var resources = Game.Resources.getValue();
    for (var name in this.price) {
      if (name != 'time' && resources[name].amount < (this.price[name])) {
        return false;
      }
    }
    return true;
  };
};

Game.Building.special.Colosseum = {
  tournaments: {},

  getCooldownPeriod: function(level) {
    return 86400 - ( (level - 1) * 580 ); // 24 hours - bonus time
  },

  checkCanStart: function() {
    var user = Meteor.user();
    var level = Colosseum.getCurrentLevel();

    if (!level
     ||  (user
       && user.timeLastTournament
       && user.timeLastTournament > Game.getCurrentServerTime() - Game.Building.special.Colosseum.getCooldownPeriod(level)
      )
    ) {
      return false;
    }

    return true;
  }
};

initBuildingSpecialColosseumContent();

};