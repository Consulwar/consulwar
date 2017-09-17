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
          const conditionIdParts = legacyEffect.condition.split('/');
          let type;
          let group;
          let special;
          let side;
          let engName;

          switch(conditionIdParts[0]) {
            case 'Unique':
              engName = conditionIdParts[1];
              break;
            case 'Building':
            case 'Research':
              [type, group, engName] = conditionIdParts;
              break;
            case 'Unit':
              if (conditionIdParts.length == 1) {
                type = 'Unit';
              } else {
                if (conditionIdParts[1] === 'Ground') {
                  [type, group, special, side, engName] = conditionIdParts;
                } else {
                  [type, group, side, engName] = conditionIdParts;
                }
              }
              break;
            default:
              throw Meteor.Error('Неизвестное условие');
              break;
          }
          
          if (type || group || special || engName) {
            legacyEffect.condition = {};
          }

          if (type) {
            type = type.toLocaleLowerCase();
            legacyEffect.condition.type = Game.newToLegacyNames[type] || type;
          }
          
          if (group) {
            group = group.toLocaleLowerCase();
            legacyEffect.condition.group = Game.newToLegacyNames[group] || group;
          }

          if (special) {
            special = special.toLocaleLowerCase();
            legacyEffect.condition.special = Game.newToLegacyNames[special] || special;
          }

          if (engName) {
            engName = engName.toLocaleLowerCase();
            legacyEffect.condition.engName = Game.newToLegacyNames[engName] || engName;
          }
        }
        
        options.effect.push(new Game.Effect[effectType](legacyEffect));
      });
    });
  }

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