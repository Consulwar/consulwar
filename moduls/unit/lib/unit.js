import { Meteor } from 'meteor/meteor';
import { default as Game, game } from '/moduls/game/lib/main.game';
import User from '/imports/modules/User/lib/User';

import UnitCollection from '/imports/modules/Unit/lib/UnitCollection';

import calculateGroupPower from '../../battle/lib/imports/calculateGroupPower';

let unitItems;
Meteor.startup(() => {
  if (Meteor.isClient) {
    unitItems = require('/imports/content/Unit/client').default;
  } else {
    unitItems = require('/imports/content/Unit/server').default;
  }
});

Game.Unit = {

  location: {
    HOME: 1,
    PLANET: 2,
    SHIP: 3
  },

  Collection: UnitCollection,

  getArmy: function ({ id } = {}) {
    return Game.Unit.Collection.findOne({
      _id: id
    });
  },

  getHangarArmy({ userId = Meteor.userId() } = {}) {
    return Game.Unit.Collection.findOne({
      user_id: userId,
      location: Game.Unit.location.HOME,
    });
  },

  getHomeFleetArmy({
    userId,
    homePlanet = Game.Planets.getBase(userId || Meteor.userId()),
  } = {}) {
    if (homePlanet) {
      return Game.Unit.getArmy({ id: homePlanet.armyId });
    }

    if (Meteor.isServer) {
      throw new Meteor.Error('Сперва нужно открыть космос', userId);
    }
    return null;
  },

  get({ id, ...options }) {
    let record;

    if (id.indexOf('Unit/Human/Ground') !== -1) {
      record = Game.Unit.getHangarArmy(options);
    } else {
      record = Game.Unit.getHomeFleetArmy(options);
    }

    if (record && record.units && record.units[id]) {
      return record.units[id];
    }
    return 0;
  },

  has({ id, count = 1 }) {
    return unitItems[id].totalCount() >= count;
  },

  calculateUnitsPower: function(units, isEarth = false) {
    const group = {};

    _(units).pairs().forEach(([id, count]) => {
      const unit = unitItems[id];
      let characteristics;
      if (isEarth) {
        characteristics = unit.getBaseCharacteristics();
      } else {
        characteristics = unit.getCharacteristics();
      }

      let insertedUnit;
      if (_.isNumber(unit.power)) {
        insertedUnit = {
          power: unit.power,
          count,
        };
      } else {
        insertedUnit = {
          weapon: {
            damage: {
              max: characteristics.weapon.damage.max,
            },
          },
          health: {
            armor: characteristics.health.armor,
          },
          count,
        };
      }

      group[id] = insertedUnit;
    });

    return calculateGroupPower(group);
  },

  calcUnitsHealth: function(units, userId = Meteor.userId()) {
    if (!units) {
      return 0;
    }

    let power = 0;
    _(units).pairs().forEach(([id, count]) => {
      const life = unitItems[id].getCharacteristics({ userId }).health.armor;
      if (life && count) {
        power += (life * count);
      }
    });
    
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

initUnitLib = function() {
'use strict';

initBattleLib();

};
