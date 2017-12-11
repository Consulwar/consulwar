import FlightEvents from '/imports/modules/Space/lib/flightEvents';

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

  getByArtefact: function (artefact) {
    var condition = {
      userId: Meteor.userId(),
    };
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

  getColonies: function () {
    return Game.Planets.Collection.find({
      userId: Meteor.userId(),
      status: Game.Planets.STATUS.HUMANS,
    }).fetch();
  },

  getPlanetsWithArmy(userId = Meteor.userId()) {
    return Game.Planets.Collection.find({
      userId,
      armyId: { $exists: true, $ne: null },
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
    var planet = Game.Planets.getOne(planetId, userId);
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
      if (army && army.units && army.units.army) {
        return army.units.army.fleet;
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

  getEngineLevel: function() {
    return Game.Research.get({
      group: 'evolution',
      engName: 'hyperdrive',
    });
  },
};

initCosmosConfigLib();
initCosmosContent();

};
