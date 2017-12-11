initBuildingLib = function() {
'use strict';

game.Building = function(options){
  // New-to-legacy
  const idParts = options.id.split('/');
  options.name = options.title;
  options.engName = idParts[idParts.length - 1].toLocaleLowerCase();

  if (Game.newToLegacyNames[options.engName]) {
    options.engName = Game.newToLegacyNames[options.engName];
  }

  Game.newToLegacyEffects(options);

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

  game.Building.superclass.constructor.apply(this, arguments);

  this.type = 'building';

  if (Game.Building.items[this.group][this.engName]) {
    throw new Meteor.Error('Ошибка в контенте', 'Дублируется здание ' + this.group + ' ' + this.engName);
  }

  Game.Building.items[this.group][this.engName] = this;

  this.url = function(options) {
    options = options || {
      group: this.group,
      item: this.engName
    };
    return Router.routes[this.type].path(options);
  };

  this.icon = function() {
    return '/img/game/building/' + this.group + '/i/' + this.engName + '.png';
  };

  this.image = function() {
    return '/img/game/building/' + this.group + '/' + this.engName + '.jpg';
  };
};
game.extend(game.Building, game.Item);

Game.Building = {
  Collection: new Meteor.Collection('buildings'),

  getValue: function({
    user,
    userId = user ? user._id : Meteor.userId(),
  } = {}) {
    return Game.Building.Collection.findOne({ user_id: userId });
  },

  get: function({ group, engName, ...options } = {}) {
    var buildings = Game.Building.getValue(options);

    if (buildings && buildings[group] && buildings[group][engName]) {
      return buildings[group][engName];
    } else {
      return 0;
    }
  },

  has: function({ level = 1, ...options } = {}) {
    return Game.Building.get(options) >= level;
  },

  items: {
    residential: {},
    military: {}
  },

  special: {}
};

initBuildingContent();

};