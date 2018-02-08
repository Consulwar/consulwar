initResearchLib = function() {
'use strict';

game.Research = function(options){
  // New-to-legacy
  const idParts = options.id.split('/');
  options.name = options.title;
  options.engName = idParts[idParts.length - 1].toLocaleLowerCase();

  if (Game.newToLegacyNames[options.engName]) {
    options.engName = Game.newToLegacyNames[options.engName];
  }

  const newToLegacyNames = {
    gammadrone: 'gammabetaalpha',
    wasp: 'royalwasphornet',
    mirage: 'mirageghostphantom',
    frigate: 'frigatesupportbattle',
    truckc: 'truckctruckbtrucka',
    cruiser: 'cruiserlinearnonlinear',
    battleship: 'battleshipquadhex',
    carrier: 'carrierbaseprojectx',
    dreadnought: 'dreadnoughtbeamplasma',
    railgun: 'railgunsniperartillery',
    reaper: 'reaperancientmythical',
    flagship: 'flagshiproyalimperial',
  }
  if (newToLegacyNames[options.engName]) {
    options.engName = newToLegacyNames[options.engName];
  }

  Game.newToLegacyEffects(options);

  if (_(options.basePrice).isFunction()) {
    this._basePrice = options.basePrice;
    options.basePrice = function(level = this.currentLevel()) {
      const price = this._basePrice(level);
      const realPrice = {};
      _(price).keys().forEach((resourceName) => {
        let realName = resourceName.toLocaleLowerCase();
        if (Game.newToLegacyNames[realName]) {
          realName = Game.newToLegacyNames[realName];
        }
        realPrice[realName] = [
          price[resourceName][0],
          Game.functions[price[resourceName][1]],
          price[resourceName][2],
        ];
      });
      return realPrice;
    }
  }

  this._requirements = options.requirements;
  options.requirements = function(level = this.currentLevel()) {
    const requirements = this._requirements(level);

    requirements.forEach((requirement) => {
      let [className, group, engName] = requirement[0].split('/');
      if (Game.newToLegacyNames[engName]) {
        engName = Game.newToLegacyNames[engName];
      }
      requirement[0] = Game[className].items[group.toLocaleLowerCase()][engName.toLocaleLowerCase()];
    });

    return requirements;
  }
  //

  game.Research.superclass.constructor.apply(this, arguments);

  if (Game.Research.items[this.group][this.engName]) {
    throw new Meteor.Error('Ошибка в контенте', 'Дублируется исследование ' + this.group + ' ' + this.engName);
  }

  Game.Research.items[this.group][this.engName] = this;

  this.url = function(options) {
    options = options || {
      group: this.group,
      item: this.engName
    };
    
    return Router.routes[this.type].path(options);
  };

  this.icon = function() {
    return '/img/game/research/' + this.group + '/i/' + this.engName + '.png';
  };

  this.image = function() {
    return '/img/game/research/' + this.group + '/' + this.engName + '.jpg';
  };

  this.type = 'research';
};
game.extend(game.Research, game.Item);

Game.Research = {
  Collection: new Meteor.Collection('researches'),

  getValue: function({
    user,
    userId = user ? user._id : Meteor.userId(),
  } = {}) {
    return Game.Research.Collection.findOne({
      user_id: userId,
    });
  },

  get: function({ group, engName, ...options}) {
    var researches = Game.Research.getValue(options);

    if (researches && researches[group] && researches[group][engName]) {
      return researches[group][engName];
    } else {
      return 0;
    }
  },

  has: function({ level, ...options}) {
    level = level || 1;
    return Game.Research.get(options) >= level;
  },

  items: {
    evolution: {},
    fleetups: {}
  }
};

initResearchContent();

};