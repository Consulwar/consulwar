initBuildingLib = function() {
'use strict';

game.Building = function(options){
  // New-to-legacy
  const idParts = options.id.split('/');
  options.name = options.title;
  options.engName = idParts[idParts.length - 1].toLocaleLowerCase();

  options.effect = [];
  if (options.effects) {
    _(options.effects).keys().forEach((effectType) => {
      options.effects[effectType].forEach((effect) => {
        const legacyEffect = { 
          ...effect,
          pretext: effect.textBefore,
          aftertext: effect.textAfter,
        };

        if (legacyEffect.condition) {
          legacyEffect.condition = {
            ...legacyEffect.condition,
            engName: legacyEffect.id,
          }
        }
        
        options.effect.push(new Game.Effect[effectType](legacyEffect));
      });
    });
  }

  this._basePrice = options.basePrice;
  options.basePrice = function(level = this.currentLevel()) {
    const price = this._basePrice(level);
    _(price).keys().forEach((resourceName) => {
      price[resourceName][1] = Game.functions[price[resourceName][1]];
    });
    return price;
  }

  this._requirements = options.requirements;
  options.requirements = function(level = this.currentLevel()) {
    const requirements = this._requirements(level);

    requirements.forEach((requirement) => {
      const [className, group, engName] = requirement[0].split('/');
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

  getValue: function() {
    return Game.Building.Collection.findOne({user_id: Meteor.userId()});
  },

  get: function(group, name) {
    var buildings = Game.Building.getValue();

    if (buildings && buildings[group] && buildings[group][name]) {
      return buildings[group][name];
    } else {
      return 0;
    }
  },

  has: function(group, name, level) {
    level = level || 1;
    return Game.Building.get(group, name) >= level;
  },

  items: {
    residential: {},
    military: {}
  },

  special: {}
};

initBuildingContent();

};