import { Meteor } from 'meteor/meteor';
import { default as Game, game } from '/moduls/game/lib/main.game';

import traverseGroup from '../../battle/lib/imports/traverseGroup';
import calculateGroupPower from '../../battle/lib/imports/calculateGroupPower';

Game.Unit = {

  location: {
    HOME: 1,
    PLANET: 2,
    SHIP: 3
  },

  Collection: new Meteor.Collection('units'),

  getArmy: function ({
    id,
  } = {}) {
    return Game.Unit.Collection.findOne({
      _id: id
    });
  },

  getHangarArmy({ userId = Meteor.userId() }) {
    return Game.Unit.Collection.findOne({
      user_id: userId,
      location: Game.Unit.location.HOME,
    });
  },

  getHomeFleetArmy({
    userId,
    homePlanet = Game.Planets.getBase(userId || Meteor.userId()),
  } = {}) {
    return Game.Unit.getArmy({ id: homePlanet.armyId });
  },

  get: function({ group, engName, ...options }) {
    const record = Game.Unit.getHomeFleetArmy(options);

    if (record
      && record.units
      && record.units.army
      && record.units.army[group]
      && record.units.army[group][engName]
    ) {
      return record.units.army[group][engName];
    } else {
      return 0;
    }
  },

  has: function({ group, engName, count = 1 }) {
    return Game.Unit.Collection.findOne({
      [`units.army.${group}.${engName}`]: { $gte: count },
    });
  },

  calculateUnitsPower: function(units, isEarth = false) {
    let group = {};

    traverseGroup(units, function(armyName, typeName, unitName, count) {
      let unit = Game.Unit.items[armyName][typeName][unitName];
      let characteristics;
      if (isEarth) {
        characteristics = unit.options.characteristics;
      } else {
        characteristics = unit.characteristics;
      }

      let insertedUnit;
      if (_.isNumber(unit.power)) {
        insertedUnit = {
          power: unit.power,
          count: count
        };
      } else {
        insertedUnit = {
          weapon: {
            damage: {
              max: characteristics.weapon.damage.max
            }
          },
          health: {
            armor: characteristics.health.armor
          },
          count: count
        };
      }

      if (!group[armyName]) {
        group[armyName] = {};
      }

      if (!group[armyName][typeName]) {
        group[armyName][typeName] = {};
      }

      group[armyName][typeName][unitName] = insertedUnit;
    });

    return calculateGroupPower(group);
  },

  calcUnitsHealth: function(units) {
    if (!units) {
      return 0;
    }

    var power = 0;
    for (var side in units) {
      for (var group in units[side]) {
        for (var name in units[side][group]) {
          var life = Game.Unit.items[side][group][name].characteristics.health.armor;
          var count = units[side][group][name];
          if (life && count) {
            power += (life * count);
          }
        }
      }
    }
    return power;
  },

  items: {
    army: {
      fleet: {},
      ground: {},
      defense: {},
      instant: {}
    },
    reptiles: {
      fleet: {},
      ground: {},
      heroes: {}
    }
  },

  battleEffects: {}
};

game.Unit = function (options) {
  this.id = options.id;
  this.title = options.title;
  // New-to-legacy
  const idParts = options.id.split('/');
  options.name = options.title;
  options.engName = idParts[idParts.length - 1].toLocaleLowerCase();

  if (Game.newToLegacyNames[options.engName]) {
    options.engName = Game.newToLegacyNames[options.engName];
  }

  if (idParts[2] === 'Ground') {
    options.characteristics.special = idParts[3].toLocaleLowerCase();
  }

  game.setToMenu = 'army';
  game.setToSide = idParts[2] === 'Space' ? 'fleet' : idParts[2].toLocaleLowerCase();

  const newToLegacyUpgradeNames = {
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
  options.fleetup = newToLegacyUpgradeNames[options.engName];

  if (options.requirements) {
    this._requirements = options.requirements;
    options.requirements = function () {
      const requirements = this._requirements();

      requirements.forEach((requirement) => {
        let [className, group, engName] = requirement[0].split('/');
        if (Game.newToLegacyNames[engName]) {
          engName = Game.newToLegacyNames[engName];
        }
        requirement[0] = Game[className].items[group.toLocaleLowerCase()][engName.toLocaleLowerCase()];
      });

      return requirements;
    }
  }

  this._targets = options.targets;
  options.targets = function () {
    if (idParts[2] === 'Ground') {
      return this._targets.map((target) => {
        let [, side, type, group, engName] = target.split('/');
        engName = engName.toLocaleLowerCase();
        if (Game.newToLegacyNames[engName]) {
          engName = Game.newToLegacyNames[engName];
        }
        side = (side === 'Human' ? 'army' : 'reptiles');
        return Game.Unit.items[side].ground[engName.toLocaleLowerCase()];
      });
    } else {
      return this._targets.map((target) => {
        let [, side, type, engName] = target.split('/');
        engName = engName.toLocaleLowerCase();
        if (Game.newToLegacyNames[engName]) {
          engName = Game.newToLegacyNames[engName];
        }
        side = (side === 'Human' ? 'army' : 'reptiles');
        return Game.Unit.items[side].fleet[engName.toLocaleLowerCase()];
      });
    }
  }

  if (options.basePrice) {
    this._basePrice = options.basePrice;
    options.basePrice = {};
    _(this._basePrice).keys().forEach((resourceName) => {
      let realName = resourceName.toLocaleLowerCase();
      if (Game.newToLegacyNames[realName]) {
        realName = Game.newToLegacyNames[realName];
      }
      options.basePrice[realName] = this._basePrice[resourceName];
    });
  }
  //

  game.Unit.superclass.constructor.apply(this, arguments);

  if (Game.Unit.items.army[this.side][this.engName]) {
    throw new Meteor.Error('Ошибка в контенте', 'Дублируется юнит army ' + this.side + ' ' + this.engName);
  }

  Game.Unit.items.army[this.side][this.engName] = this;

  this.color = 'cw--color_metal';

  this.star = function () {
    if (!options.fleetup || !Game.Research.items.fleetups[options.fleetup]) {
      return 0;
    }

    var level = Game.Research.items.fleetups[options.fleetup].currentLevel();
    if (level < 10) {
      return 0;
    } else if (level < 50) {
      return 1;
    } else if (level < 100) {
      return 2;
    } else {
      return 3;
    }
  };

  this.url = function (options) {
    options = options || {
      group: this.group,
      item: this.engName
    };

    return Router.routes[this.type].path(options);
  };

  this.icon = function () {
    return '/img/game/unit/' + this.side + '/' + this.group + '/i/' + this.engName + '.png';
  };

  this.getIcon = this.icon;

  this.image = function () {
    return '/img/game/unit/' + this.side + '/' + this.group + '/' + this.engName + '.jpg';
  };

  this.getImage = this.image;

  this.getCard = this.image;

  this.totalCount = function () {
    var armies = Game.Unit.Collection.find({
      user_id: Meteor.userId()
    }).fetch();

    var result = 0;
    for (var i = 0; i < armies.length; i++) {
      if (armies[i].units
        && armies[i].units.army
        && armies[i].units.army[this.group]
        && armies[i].units.army[this.group][this.engName]
      ) {
        result += parseInt(armies[i].units.army[this.group][this.engName]);
      }
    }
    return result;
  };

  if (options.power !== undefined) {
    this.power = options.power;
  }

  this.type = 'unit';
  this.side = 'army';
  this.battleEffects = options.battleEffects;
  this.maxCount = options.maxCount;

  // new
  this.add = ({ count, userId }) => (
    Game.Unit.add({
      engName: this.engName,
      group: this.group,
      count,
    }, userId)
  );
  //
};
game.extend(game.Unit, game.Item);

game.ReptileUnit = function (options) {
  this.id = options.id;
  this.title = options.title;
  // New-to-legacy
  const idParts = options.id.split('/');
  options.name = options.title;
  options.engName = idParts[idParts.length - 1].toLocaleLowerCase();
  options.fleetup = options.upgrade;

  if (Game.newToLegacyNames[options.engName]) {
    options.engName = Game.newToLegacyNames[options.engName];
  }

  game.setToMenu = 'reptiles';
  game.setToSide = idParts[2] === 'Space' ? 'fleet' : idParts[2].toLocaleLowerCase();

  this._targets = options.targets;
  options.targets = function () {
    if (idParts[2] === 'Ground') {
      return this._targets.map((target) => {
        let [, side, type, group, engName] = target.split('/');
        engName = engName.toLocaleLowerCase();
        if (Game.newToLegacyNames[engName]) {
          engName = Game.newToLegacyNames[engName];
        }
        side = (side === 'Human' ? 'army' : 'reptiles');
        return Game.Unit.items[side].ground[engName.toLocaleLowerCase()];
      });
    } else {
      return this._targets.map((target) => {
        let [, side, type, engName] = target.split('/');
        engName = engName.toLocaleLowerCase();
        if (Game.newToLegacyNames[engName]) {
          engName = Game.newToLegacyNames[engName];
        }
        side = (side === 'Human' ? 'army' : 'reptiles');
        return Game.Unit.items[side].fleet[engName.toLocaleLowerCase()];
      });
    }
  }

  if (options.basePrice) {
    this._basePrice = options.basePrice;
    options.basePrice = {};
    _(this._basePrice).keys().forEach((resourceName) => {
      let realName = resourceName.toLocaleLowerCase();
      if (Game.newToLegacyNames[realName]) {
        realName = Game.newToLegacyNames[realName];
      }
      options.basePrice[realName] = this._basePrice[resourceName];
    });
  }
  //
  game.ReptileUnit.superclass.constructor.apply(this, arguments);

  if (Game.Unit.items.reptiles[this.group][this.engName]) {
    throw new Meteor.Error('Ошибка в контенте', 'Дублируется юнит reptiles ' + this.group + ' ' + this.engName);
  }

  Game.Unit.items.reptiles[this.group][this.engName] = this;

  this.url = function (options) {
    options = options || {
      group: this.group,
      item: this.engName
    };

    return Router.routes[this.type].path(options);
  };

  this.getOverlayOwn = function () {
    return `/img/game/unit/reptiles/${this.group}/${this.engName}.jpg`;
  };

  this.icon = function () {
    return '/img/game/unit/' + this.side + '/' + this.group + '/i/' + this.engName + '.png';
  };

  this.getIcon = this.icon;

  this.image = function () {
    return '/img/game/unit/' + this.side + '/' + this.group + '/' + this.engName + '.jpg';
  };

  this.getImage = this.image;

  this.canBuild = function () {
    return false;
  };

  this.currentLevel = function () {
    return 0;
  };

  this.isEnoughResources = function () {
    return true;
  };

  if (options.power) {
    this.power = options.power;
  }

  this.type = 'reptileUnit';
  this.side = 'reptiles';
  this.battleEffects = options.battleEffects;
};
game.extend(game.ReptileUnit, game.Item);

game.ReptileHero = function (options) {
  game.ReptileHero.superclass.constructor.apply(this, arguments);

  this.type = 'reptileHero';
};
game.extend(game.ReptileHero, game.ReptileUnit);

game.BattleEffect = function (options) {
  Game.Unit.battleEffects[options.key] = options.func;
};

initUnitLib = function() {
'use strict';

initBattleLib();

};

const Unit = game.Unit;
const ReptileUnit = game.ReptileUnit;

export { Unit, ReptileUnit };
