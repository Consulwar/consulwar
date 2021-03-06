import FlightEvents from '/imports/modules/Space/lib/flightEvents';
import { Meteor } from 'meteor/meteor';
import { _ } from 'lodash';
import User from '../../../imports/modules/User/lib/User';
import Game from '/moduls/game/lib/main.game';

let Hyperdrive;
if (Meteor.isClient) {
  Hyperdrive = require('/imports/content/Research/Evolution/client/Hyperdrive').default;
} else {
  Hyperdrive = require('/imports/content/Research/Evolution/server/Hyperdrive').default;
}

initCosmosLib = function() {
'use strict';

game.PlanetType = function(options) {
  if (Game.Planets.types[options.engName]) {
    throw new Meteor.Error('Ошибка в контенте', 'Дублируется тип планеты ' + options.engName);
  }
  Game.Planets.types[options.engName] = options;
};

Game.Cosmos = {};

Game.Planets = {

  Collection: new Meteor.Collection('planets'),

  STATUS: {
    NOBODY: 1,
    HUMANS: 2,
    REPTILES: 3,
  },

  RENAME_PLANET_PRICE: 200,
  MAX_EXTRA_COLONIES: 10,

  getExtraColoniesCount: function () {
    var basePlanet = Game.Planets.getBase();
    return (basePlanet && basePlanet.extraColoniesCount)
      ? basePlanet.extraColoniesCount
      : 0;
  },

  getExtraColonyPrice: function (count) {
    return [
      500,  // 1
      1110, // 2
      1830, // 3
      2660, // 4
      3600, // 5
      4650, // 6
      5810, // 7
      7080, // 8
      8460, // 9
      9950  // 10
    ][count || Game.Planets.getExtraColoniesCount()];
  },

  getAll: function (userId = Meteor.userId()) {
    return Game.Planets.Collection.find({
      userId,
    });
  },

  getAllByOwner(user = Meteor.user()) {
    return Game.Planets.Collection.find({
      minerUsername: user.username,
    });
  },

  getByArtefact: function (artefact, minerUsername) {
    var condition = {};
    if (minerUsername) {
      condition.minerUsername = minerUsername;
    }
    condition['artefacts.' + artefact] = { $gt: 0 };
    return Game.Planets.Collection.find(condition).fetch();
  },

  getOne: function (id) {
    return Game.Planets.Collection.findOne({
      _id: id,
    });
  },

  getBase: function (userId = Meteor.userId()) {
    return Game.Planets.Collection.findOne({
      userId,
      isHome: true,
    });
  },

  getColonies: function (options = {}) {
    const userId = options.userId || (!options.user ? Meteor.userId() : null);
    const user = options.user || User.getById({ userId });

    return Game.Planets.Collection.find({
      minerUsername: user.username,
    }).fetch();
  },

  getPlanetsWithArmy(options = {}) {
    const userId = options.userId || (!options.user ? Meteor.userId() : null);
    const user = options.user || User.getById({ userId });

    return Game.Planets.Collection.find({
      armyUsername: user.username,
    }).fetch();
  },

  getHumanPlanetsByUsername(username) {
    return Game.Planets.Collection.find({
      username,
      $or: [
        {
          status: Game.Planets.STATUS.HUMANS,
        },
        {
          armyId: { $exists: true, $ne: null },
        },
      ],
    }).fetch();
  },

  getMaxColoniesCount: function () {
    return 3 + Game.User.getLevel() + Game.Planets.getExtraColoniesCount();
  },

  getColoniesCount: function () {
    return Game.Planets.getColonies().length;
  },

  checkCanHaveMoreColonies: function (baseId, isLeavingBase, targetId) {
    // count already targeted planets
    var targets = [];
    var isTargetInList = false;
    var fleets = FlightEvents.getFleetsEvents().fetch();
    var id = null;

    for (var i = 0; i < fleets.length; i++) {
      var fleet = fleets[i];

      if (!fleet.data.isHumans) {
        continue;
      }

      id = fleet.data.isOneway
        ? fleet.data.targetId
        : fleet.data.startPlanetId;

      if (targets.indexOf(id) == -1) {
        targets.push(id);
      }

      // base is target of another fleet, so we can't leave base
      if (id == baseId) {
        isLeavingBase = false;
      }

      // target planet in list, so we can send more
      if (id == targetId) {
        isTargetInList = true;
      }
    }

    // add current colonies
    var colonies = Game.Planets.getColonies();
    for (var n = 0; n < colonies.length; n++) {
      id = colonies[n]._id;
      if (targets.indexOf(id) == -1) {
        targets.push(id);
      }
    }

    // finaly count and check
    var current = targets.length;

    if (isLeavingBase) {
      current--;
    }

    if (isTargetInList) {
      current--;
    }

    return (current < Game.Planets.getMaxColoniesCount()) ? true : false;
  },

  getFleetUnits: function (planetId, userId = Meteor.userId()) {
    var planet = Game.Planets.getOne(planetId);
    if (!planet) {
      return null;
    }

    if (planet.mission) {
      if (planet.mission.units) {
        return planet.mission.units;
      } else {
        return _.clone(Game.Battle.items[planet.mission.type].level[planet.mission.level].enemies);
      }
    } else if (planet.armyId || planet.isHome) {
      var army = (planet.isHome)
        ? Game.Unit.getHomeFleetArmy({ userId })
        : Game.Unit.getArmy({ id: planet.armyId });
      if (army && army.units) {
        return _.pickBy(army.units, (unit, id) => id.indexOf('/Space/') !== -1) || null;
      }
    }

    return null;
  },

  calcDistance: function (start, end) {
    return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  },

  // ------------------------------------------------------------------------
  // Planets generation
  // ------------------------------------------------------------------------

  MIN_PLANET_DISTANCE: 1,

  types: {},

  getEngineLevel: function(user = Meteor.user()) {
    let minEngine = 0;
    switch (Game.User.getLevel(user.rating)) {
      case 0:
        minEngine = 40;
        break;
      case 1:
        minEngine = 20;
        break;
      default:
        minEngine = 0;
        break;
    }

    if (user.krampusEngineBuff && user.krampusBuffedTill && user.krampusBuffedTill > Game.getCurrentServerTime()) {
      switch (user.krampusEngineBuff) {
        case 'Normal':
          minEngine = 60;
          break;
        case 'Bronze':
          minEngine = 80;
          break;
        case 'Silver':
          minEngine = 100;
          break;
        case 'Gold':
          minEngine = 120;
          break;
      }
    }

    return Math.max(Hyperdrive.getCurrentLevel({ user }), minEngine);
  },
};

initCosmosConfigLib();
initCosmosContent();

};
