import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Game from '/moduls/game/lib/main.game';
import Config from '/imports/modules/Space/server/config';
import PlanetGeneration from '/imports/modules/Space/lib/planetGeneration';
import Space from '/imports/modules/Space/lib/space';
import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';
import SpecialEffect from '/imports/modules/Effect/lib/SpecialEffect';

const {
  calcSegmentRandomPoints,
  calcSegmentPlanetsAmount,
  calcSegmentCenter,
} = PlanetGeneration;

initCosmosPlanetsServer = function() {
'use strict';

Game.Planets.Collection._ensureIndex({
  userId: 1,
  isHome: 1
});

Game.Planets.Collection._ensureIndex({
  username: 1,
});

Game.Planets.Collection._ensureIndex({
  armyUsername: 1,
});

Game.Planets.Collection._ensureIndex({
  minerUsername: 1,
});

Game.Planets.Collection._ensureIndex({
  status: 1,
});

Game.Planets.actualize = function() {
  var planets = Game.Planets.getAll().fetch();
  if (!planets) {
    return;
  }

  var planet = null;
  var i = 0;

  // aggregate information about sectors
  var sectors = {};

  for (i = 0; i < planets.length; i++) {
    planet = planets[i];

    if (!sectors[planet.hand]) {
      sectors[planet.hand] = {};
    }
    if (!sectors[planet.hand][planet.segment]) {
      sectors[planet.hand][planet.segment] = {
        occupied: 0,
        total: 0
      };
    }

    if (planet.mission) {
      sectors[planet.hand][planet.segment].occupied += 1;
    }
    sectors[planet.hand][planet.segment].total += 1;
  }

  const timeCurrent = Game.getCurrentTime();

  const ownedPlanets = Game.Planets.getAllByOwner();
  ownedPlanets.forEach((planet) => {
    if (planet.status === Game.Planets.STATUS.HUMANS) {
      // auto collect artefacts
      if (planet.timeArtefacts) {
        const delta = timeCurrent - planet.timeArtefacts;
        const count = Math.floor(delta / Game.Cosmos.COLLECT_ARTEFACTS_PERIOD);
        if (count > 0) {
          const artefacts = Game.Planets.getArtefacts(planet, count);
          if (artefacts) {
            Game.Resources.add(artefacts);
          }
          planet.timeArtefacts += (Game.Cosmos.COLLECT_ARTEFACTS_PERIOD * count);
          Game.Planets.update(planet);
        }
      }
    }
  });

  // update planets

  for (i = 0; i < planets.length; i++) {
    planet = planets[i];

    // don't update home planet
    if (planet.isHome) {
      continue;
    }

    if (planet.status !== Game.Planets.STATUS.HUMANS && !planet.armyId) {
      // spawn enemies
      if (planet.timeRespawn <= timeCurrent) {
        if (!planet.mission) {
          // create new mission
          var sector = sectors[planet.hand][planet.segment];
          if (sector.occupied < 2
           || sector.occupied < Math.floor(sector.total / 2)
          ) {
            if (Game.Random.random() <= 0.5) {
              planet.mission = Game.Planets.generateMission(planet);
              sector.occupied += 1;
              planet.status = Game.Planets.STATUS.REPTILES;
            }
          }
        } else if (planet.mission.units) {
          // restore previous
          planet.mission.units = null;
        }
        planet.timeRespawn = timeCurrent + Config.ENEMY_RESPAWN_PERIOD;
        Game.Planets.update(planet);
      }
    }
  }
};

Game.Planets.update = function(planet) {
  if (!planet._id || !planet.userId) {
    return null;
  }

  const data = _.omit(planet, '_id');

  Game.Planets.Collection.update({
    _id: planet._id,
  }, {
    $set: data,
  });

  return data;
};

Game.Planets.add = function(planet, user = Meteor.user()) {
  return Game.Planets.Collection.insert({
    ...planet,
    userId: user._id,
    username: user.username,
  });
};

Game.Planets.generateArtefacts = function(galactic, hand, segment, type, userId = Meteor.userId()) {
  // get artefacts spread config by distance from home planet or center
  var basePlanet = Game.Planets.getBase(userId);
  var distTotal = galactic.segments;
  var distCurrent = distTotal - segment;

  if (basePlanet && hand == basePlanet.hand) {
    if (segment > basePlanet.segment) {
      distTotal = basePlanet.segment;
      distCurrent = segment - basePlanet.segment;
    } else if (segment < basePlanet.segment) {
      distTotal = basePlanet.segment;
      distCurrent = basePlanet.segment - segment;
    } else {
      distCurrent = 0;
      distTotal = 1;
    }
  }

  if (distCurrent < 0) {
    distCurrent = 0;
  }

  var len = Game.Cosmos.ARTEFACTS_GROUP_SPREAD.length;
  var index = Math.floor( distCurrent / distTotal * (len - 1) );
  var groups = Game.Cosmos.ARTEFACTS_GROUP_SPREAD[ index ];

  // sort all available artefacts by group
  var artefacts = type.artefacts();
  var items = {};
  var i = 0;

  for (i = 0; i < artefacts.length; i++) {
    var artefact = artefacts[i][0];
    var chance = artefacts[i][1];

    if (!items[artefact.group]) {
      items[artefact.group] = [];
    }

    items[artefact.group].push({
      name: artefact.engName,
      chance: chance
    });
  }

  // select available groups
  var arrGroups = [];
  for (var name in groups) {
    arrGroups.push({
      name: name,
      chance: groups[name].chance,
      power: groups[name].power
    });
  }

  // select 3 artefacts
  var result = {};

  var maxValue = 0;
  for (i = 0; i < arrGroups.length; i++) {
    maxValue += arrGroups[i].chance;
  }

  for (i = 0; i < 3; i++) {
    // select random group
    var randomVal = Game.Random.random() * maxValue;
    var val = 0;

    for (var j = 0; j < arrGroups.length; j++) {
      val += arrGroups[j].chance;
      if (randomVal <= val) {
        break;
      }
    }

    var groupArtefacts = items[ arrGroups[j].name ];

    // select random artefact from chosen group
    if (groupArtefacts && groupArtefacts.length > 0) {
      var iRand = Game.Random.interval(0, groupArtefacts.length - 1);
      var randomItem = groupArtefacts[iRand];
      result[randomItem.name] = Math.floor(randomItem.chance * arrGroups[j].power * 100) / 100;
      groupArtefacts.splice(iRand, 1);
    }
  }

  return result;
};

Game.Planets.getArtefacts = function(planet, count) {
  if (!planet || !planet.artefacts) {
    return null;
  }

  count = (count && count > 1) ? count : 1;
  var result = null;

  for (var key in planet.artefacts) {
    // Average drop! No random!
    var income = Math.floor(count * planet.artefacts[key] / 100);

    if (Game.Random.interval(1, 99) <= count * planet.artefacts[key] % 100) {
      income++;
    }

    if (income > 0) {
      if (!result) {
        result = {};
      }
      result[key] = income;
    }
  }

  return result;
};

Game.Planets.generateType = function() {
  var result = null;
  var types = _.map(Game.Planets.types, function(item) {
    return item;
  });

  // select by chance
  if (types.length > 0) {

    var val = 0;
    var i = 0;

    for (i = 0; i < types.length; i++) {
      val += types[i].chance;
    }

    var randomVal = Game.Random.random() * val;
    val = 0;

    for (i = 0; i < types.length; i++) {
      val += types[i].chance;
      if (randomVal <= val) {
        result = types[i];
        break;
      }
    }
  }

  return result;
};

Game.Planets.generateName = function(userId = Meteor.userId()) {
  var letters = [
    'A', 'B', 'C', 'D', 'E', 'F',
    'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R',
    'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', '0', '1', '2', '3', 
    '4', '5', '6', '7', '8', '9'
  ];

  var home = Meteor.users.findOne({ _id: userId }).planetName;
  var result = home;

  while (home == result) {
    result = (
      letters[Game.Random.interval(0, 35)]
    + letters[Game.Random.interval(0, 35)]
    + letters[Game.Random.interval(0, 35)]
    + '-'
    + letters[Game.Random.interval(0, 35)]
    + letters[Game.Random.interval(0, 35)]
    + letters[Game.Random.interval(0, 35)]);
  }

  return result;
};

Game.Planets.getLastAttackTime = function() {
  var home = Game.Planets.getBase();
  if (home && home.timeLastAttack) {
    return home.timeLastAttack;
  }
  return 0;
};

Game.Planets.setLastAttackTime = function(time) {
  var home = Game.Planets.getBase();
  if (home) {
    home.timeLastAttack = time;
    Game.Planets.update(home);
  }
};

Game.Planets.getLastTradeFleetTime = function() {
  var home = Game.Planets.getBase();
  if (home && home.timeLastTradeFleet) {
    return home.timeLastTradeFleet;
  }
  return 0;
};

Game.Planets.setLastTradeFleetTime = function(time) {
  var home = Game.Planets.getBase();
  if (home) {
    home.timeLastTradeFleet = time;
    Game.Planets.update(home);
  }
};

Game.Planets.getLastFunTime = function() {
  var home = Game.Planets.getBase();
  if (home && home.timeLastFun) {
    return home.timeLastFun;
  }
  return 0;
};

Game.Planets.setLastFunTime = function(time) {
  var home = Game.Planets.getBase();
  if (home) {
    home.timeLastFun = time;
    Game.Planets.update(home);
  }
};

Game.Planets.generateMission = function(planet, userId = Meteor.userId()) {
  // check planets
  if (!planet) {
    return null;
  }

  var basePlanet = Game.Planets.getBase(userId);
  if (!basePlanet) {
    return null;
  }

  // missions config
  var missions = Game.Cosmos.PLANET_MISSIONS;

  // get mission config by distance from home planet or center
  var distTotal = basePlanet.galactic.segments;
  var distCurrent = distTotal - planet.segment;

  if (planet.hand == basePlanet.hand) {
    if (planet.segment > basePlanet.segment) {
      distTotal = basePlanet.segment;
      distCurrent = planet.segment - basePlanet.segment;
    } else if (planet.segment < basePlanet.segment) {
      distTotal = basePlanet.segment;
      distCurrent = basePlanet.segment - planet.segment;
    } else {
      distCurrent = 0;
      distTotal = 1;
    }
  }

  if (distCurrent < 0) {
    distCurrent = 0;
  }

  var index = Math.round( distCurrent / distTotal * (missions.length - 1) );
  var list = missions[ index ];
  var mission = list[ Game.Random.interval(0, list.length - 1) ];

  return {
    type: mission.type,
    level: mission.levels[ Game.Random.interval(0, mission.levels.length - 1) ]
  };
};

Game.Planets.getReptileAttackChance = function() {
  var level = Game.User.getLevel();
  return {
    home: level * 5,
    colony: level * 1
  };
};

Game.Planets.getReptileAttackMission = function() {
  var level = Game.User.getLevel();

  // missions config
  var missions = Game.Cosmos.ATTACK_MISSIONS;

  // select mission
  if (level >= missions.length) {
    level = missions.length - 1;
  }

  var list = missions[ level ];
  if (!list || list.length <= 0) {
    return null;
  }

  var mission = list[ Game.Random.interval(0, list.length - 1) ];
  return {
    type: mission.type,
    level: mission.levels[ Game.Random.interval(0, mission.levels.length - 1) ]
  };
};

// ----------------------------------------------------------------------------
// Galactic generation
// ----------------------------------------------------------------------------

var radToDeg = function(rad) {
  return rad * 180 / Math.PI;
};

var calcDistanse = function(ax, ay, bx, by) {
  return Math.sqrt( Math.pow(bx - ax, 2) + Math.pow(by - ay, 2) );
};

var hitCircleVsCircle = function(x1, y1, r1, x2, y2, r2) {
  var distance = Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) );
  return (r1 + r2 > distance) ? true : false;
};

Game.Planets.findPlanetsNearPoint = function(x, y, r) {
  var result = [];
  var planets = Game.Planets.getAll().fetch();
  var n = planets.length;

  while (n-- > 0) {
    if (calcDistanse(x, y, planets[n].x, planets[n].y) <= r) {
      result.push( planets[n] );
    }
  }

  return result;
};

Game.Planets.checkIntersects = function(planet, nearPlanets) {
  for (var i = 0; i < nearPlanets.length; i++) {
    var radius = Game.Planets.MIN_PLANET_DISTANCE / 2;
    if (
      hitCircleVsCircle(
        planet.x,
        planet.y,
        radius,
        nearPlanets[i].x,
        nearPlanets[i].y,
        radius
      )
    ) {
      return true;
    }
  }
  return false;
};

Game.Planets.getSectorsToDiscover = function(galactic, hand, segment) {
  var sectors = [];

  if (segment <= 0) {
    // central
    for (var i = 0; i < galactic.hands; i++) {
      sectors.push({
        hand: i,
        segment: 1
      });
    }

  } else {
    // near hands
    if (segment < 2 && galactic.hands > 2) {
      sectors.push({
        hand: (hand + 1 < galactic.hands ? hand + 1 : 0),
        segment: segment
      });
      sectors.push({
        hand: (hand > 0 ? hand - 1 : galactic.hands - 1),
        segment: segment
      });
    }

    // along hand
    sectors.push({
      hand: hand,
      segment: segment + 1
    });
    sectors.push({
      hand: hand,
      segment: segment - 1
    });
  }

  return sectors;
};

Game.Planets.checkSectorDiscovered = function(hand, segment, userId = Meteor.userId()) {
  var planets = Game.Planets.getAll(userId).fetch();
  for (var i = 0; i < planets.length; i++) {
    if (planets[i].hand == hand
     && planets[i].segment == segment
    ) {
      return true;
    }
  }
  return false;
};

Game.Planets.generateSector = function(
  galactic,
  hand,
  segment,
  isSkipDiscovered,
  user = Meteor.user(),
) {
  // check galactic bounds
  if (segment > galactic.segments || segment < 0) return;
  if (hand >= galactic.hands || hand < 0) return;

  // check sector already discovered
  if (isSkipDiscovered
   && Game.Planets.checkSectorDiscovered(hand, segment, user._id)
  ) {
    return;
  }

  // find near planets
  var nearPlanets = [];
  var planets = Game.Planets.getAll(user._id).fetch();
  var i = 0;

  for (i = 0; i < planets.length; i++) {
    if (planets[i].segment == segment
     || planets[i].segment == segment - 1
     || planets[i].segment == segment + 1
    ) {
      nearPlanets.push(planets[i]);
    }
  }

  // calc amount
  var amount = calcSegmentPlanetsAmount(
    hand,
    segment,
    galactic.hands,
    galactic.segments,
    galactic.minPlanets,
    galactic.maxPlanets
  );

  // find random points
  var randSpots = calcSegmentRandomPoints(
    amount,
    hand,
    segment,
    galactic.hands,
    galactic.segments,
    galactic.rotationFactor,
    galactic.narrowFactor,
    galactic.radius,
    galactic.angle
  );

  // fins free points
  var freeSpots = [];

  for (i = 0; i < randSpots.length; i++) {
    if (!Game.Planets.checkIntersects(randSpots[i], nearPlanets)) {
      freeSpots.push(randSpots[i]);
      nearPlanets.push(randSpots[i]);
    }
  }

  // add new planets
  while (freeSpots.length > 0) {

    var n = Game.Random.interval(0, freeSpots.length - 1);

    var type = Game.Planets.generateType();
    var size = Game.Random.interval( type.sizeMin, type.sizeMin );
    if (size < 1) {
      size = 1;
    }

    var artefacts = Game.Planets.generateArtefacts(
      galactic,
      hand,
      segment,
      type,
      user._id,
    );

    var newPlanet = {
      name: Game.Planets.generateName(user._id),
      type: type.engName,
      artefacts: artefacts,
      // state
      status: Game.Planets.STATUS.NOBODY,
      armyId: null,
      mission: null,
      timeRespawn: 0,
      // generation
      segment: segment,
      hand: (segment > 0 ? hand : 0),
      // appearance
      x: freeSpots[n].x,
      y: freeSpots[n].y,
      size: size
    };

    Game.Planets.add(newPlanet, user);
    freeSpots.splice(n, 1);
  }
};

Game.Planets.discover = function(planetId, user = Meteor.user()) {
  // get discovered planet
  let planet = Game.Planets.getOne(planetId);
  if (planet.isDiscovered) {
    return;
  }

  planet.isDiscovered = true;
  Game.Planets.update(planet);

  // get base planet
  let basePlanet = Game.Planets.getBase(user._id);
  if (!basePlanet) {
    return;
  }

  // find sectors to discover
  let sectors = Game.Planets.getSectorsToDiscover(basePlanet.galactic,
    planet.hand, planet.segment);

  // discover
  for (let i = 0; i < sectors.length; i++) {
    Game.Planets.generateSector(basePlanet.galactic, sectors[i].hand,
      sectors[i].segment, true, user);
  }
};

// ----------------------------------------------------------------------------
// Public methods
// ----------------------------------------------------------------------------

Meteor.methods({
  'planet.initialize': function() {
    // For planets initialization Meteor.user() required!
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'planet.initialize', user });

    var planets = Game.Planets.getAll().fetch();

    if (planets.length === 0) {

      var galactic = {
        radius: 40,
        hands: Game.Random.interval(4, 6),
        segments: 10,
        rotationFactor: Game.Random.interval(2, 5) / 100, // 0.02 - 0.05
        narrowFactor: 5,
        angle: Game.Random.random() * Math.PI * 2, // 0 - 360
        minPlanets: 400,
        maxPlanets: 500
      };

      var hand = Game.Random.interval(0, galactic.hands - 1);
      var segment = galactic.segments - 3;
      var center = calcSegmentCenter(
        hand,
        segment,
        galactic.hands,
        galactic.segments,
        galactic.rotationFactor,
        galactic.radius,
        galactic.angle
      );

      Game.Planets.add({
        name: user.planetName,
        isHome: true,
        minerUsername: user.username,
        status: Game.Planets.STATUS.HUMANS,
        type: 'terran',
        // generation
        hand: hand,
        segment: segment,
        // appearance
        x: center.x,
        y: center.y,
        size: 6,
        // galactic options
        galactic: galactic
      }, user);

      Game.Unit.initialize(user._id);

      // open near sectors at start
      Game.Planets.generateSector(galactic, hand, segment, false);
      Game.Planets.generateSector(galactic, hand, segment + 1, false);
      Game.Planets.generateSector(galactic, hand, segment - 1, false);

      // refresh all planets
      Game.Planets.actualize();
    }
  },

  'planet.discover': function(planetId) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'planet.discover', user });

    check(planetId, String);

    let cardsObject = {'planetDiscover1': 1};

    if (!Game.Cards.canUse({ cards: cardsObject, user })) {
      throw new Meteor.Error('Карточка недоступна для применения');
    }

    let cardList = Game.Cards.objectToList(cardsObject);
    let card = cardList[0];

    if (card.group !== 'planetDiscover') {
      throw new Meteor.Error('Неподходящий тип карточки');
    }

    Game.Cards.activate(card, user);

    Game.Cards.spend(cardsObject);

    Game.Planets.discover(planetId);

    // save statistic
    Game.Statistic.incrementUser(user._id, {
      'cosmos.planets.discovered': 1
    });
  },

  'planet.collectArtefacts': function(planetId, cardsObject) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'planet.collectArtefacts:', user });

    check(planetId, String);

    const planet = Game.Planets.getOne(planetId);
    if (!planet || planet.isHome || !planet.armyId) {
      throw new Meteor.Error('Ты втираешь мне какую-то дичь');
    }

    if (planet.status !== Game.Planets.STATUS.HUMANS) {
      throw new Meteor.Error('На планете не ведется добыча артефактов');
    }

    if (!cardsObject) {
      throw new Meteor.Error('Карточки не заданы');
    }

    check(cardsObject, Object);

    if (!Game.Cards.canUse({ cards: cardsObject, user })) {
      throw new Meteor.Error('Карточки недоступны для применения');
    }

    let cardList = Game.Cards.objectToList(cardsObject);

    if (cardList.length === 0) {
      throw new Meteor.Error('Карточки не выбраны');
    }

    let result = SpecialEffect.getValue({
      hideEffects: true,
      obj: { engName: 'instantCollectArtefacts' },
      instantEffects: cardList,
    });

    let cycles = result.cycles;

    if (!_.isNumber(cycles) || cycles <= 0) {
      throw new Meteor.Error('Карточки недоступны для применения');
    }

    let artefacts = Game.Planets.getArtefacts(planet, cycles);

    if (artefacts) {
      Game.Resources.add(artefacts);
    }

    for (let card of cardList) {
      Game.Cards.activate(card, user);
    }

    Game.Cards.spend(cardsObject);

    return artefacts;
  },

  'planet.changeName': function(planetId, name) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'planet.changeName', user });

    check(planetId, String);
    check(name, String);
    name = name.trim();

    if (name.length === 0) {
      throw new Meteor.Error('Имя планеты не должно быть пустым');
    }

    if (name.length > 16) {
      throw new Meteor.Error('Максимум 16 символов');
    }

    var planet = Game.Planets.getOne(planetId);
    if (!planet || planet.isHome) {
      throw new Meteor.Error('Ты втираешь мне какую-то дичь');
    }

    var userResources = Game.Resources.getValue();
    if (userResources.credits.amount < Game.Planets.RENAME_PLANET_PRICE) {
      throw new Meteor.Error('Недостаточно ГГК');
    }

    Game.Resources.spend({
      credits: Game.Planets.RENAME_PLANET_PRICE
    });

    Game.Planets.Collection.update({
      _id: planet._id
    }, {
      $set: {
        name: name
      }
    });

    Game.Payment.Expense.log(Game.Planets.RENAME_PLANET_PRICE, 'planetRename', {
      planetId: planetId,
      newName: name,
      previousName: planet.name
    });
  },

  'planet.buyExtraColony': function() {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'planet.buyExtraColony', user });

    if (Game.Planets.getExtraColoniesCount >= Game.Planets.MAX_EXTRA_COLONIES) {
      throw new Meteor.Error('Больше нельзя купить дополнительных колоний');
    }

    var price = Game.Planets.getExtraColonyPrice();
    var userResources = Game.Resources.getValue();
    if (userResources.credits.amount < price) {
      throw new Meteor.Error('Недостаточно ГГК');
    }

    Game.Resources.spend({
      credits: price
    });

    Game.Planets.Collection.update({
      userId: Meteor.userId(),
      isHome: true
    }, {
      $inc: {
        extraColoniesCount: 1
      }
    });

    Game.Payment.Expense.log(price, 'planetBuy');
  },

  'planet.startMining'(planetId) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'planet.startMining', user });

    check(planetId, String);

    const planet = Game.Planets.getOne(planetId);
    if (
         !planet
      || planet.isHome
      || !planet.armyId
      || Game.Unit.getArmy({ id: planet.armyId }).user_id !== user._id
    ) {
      throw new Meteor.Error('Ты втираешь мне какую-то дичь');
    }

    if (Game.Planets.getColoniesCount() >= Game.Planets.getMaxColoniesCount()) {
      throw new Meteor.Error('Достигнуто максимальное количество колоний');
    }

    if (planet.status === Game.Planets.STATUS.HUMANS) {
      throw new Meteor.Error('На планете уже ведется добыча артефактов');
    } else if (planet.status === Game.Planets.STATUS.REPTILES) {
      const artefacts = Game.Planets.getArtefacts(planet, 1);
      if (artefacts) {
        Game.Resources.add(artefacts);
      }
    }

    planet.timeArtefacts = Game.getCurrentTime();
    planet.status = Game.Planets.STATUS.HUMANS;
    planet.minerUsername = user.username;

    Game.Planets.update(planet);
  },

  'planet.stopMining'(planetId) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'planet.stopMining', user });

    check(planetId, String);

    const planet = Game.Planets.getOne(planetId);
    if (
         !planet
      || planet.isHome
      || planet.status !== Game.Planets.STATUS.HUMANS
      || planet.minerUsername !== user.username
    ) {
      throw new Meteor.Error('Ты втираешь мне какую-то дичь');
    }

    planet.status = Game.Planets.STATUS.NOBODY;
    planet.minerUsername = null;
    planet.timeArtefacts = null;

    Game.Planets.update(planet);
  },

  'planet.getAllByUsername'({
    username,
    userId = Meteor.users.findOne({ username })._id,
  }) {
    return Game.Planets.getAll(userId).fetch();
  },
});

Meteor.publish('planets', function(usernames = []) {
  if (this.userId) {
    if (usernames.length === 0) {
      usernames.push(Meteor.users.findOne({ _id: this.userId }).username);
    }
    return Game.Planets.Collection.find({
      username: { $in: usernames }
    });
  }
});

Meteor.publish('relatedToUserPlanets', function() {
  if (this.userId) {
    const username = Meteor.users.findOne({ _id: this.userId }).username;
    return Game.Planets.Collection.find({
      $or: [
        { armyUsername: username },
        { minerUsername: username },
      ],
    });
  }
});

// ----------------------------------------------------------------------------
// Debug methods
// ----------------------------------------------------------------------------

Game.Planets.debugCalcArtefactsChances = function() {
  var items = {};
  var planetTypes = Game.Planets.types;

  for (var key in planetTypes) {
    var type = planetTypes[key];
    var artefacts = type.artefacts();

    for (var i = 0; i < artefacts.length; i++) {
      var name = artefacts[i][0].name;
      var group = artefacts[i][0].group;

      if (!items[group]) {
        items[group] = {};
      }

      if (!items[group][name]) {
        items[group][name] = 0;
      }

      items[group][name] += artefacts[i][1] * type.chance;
    }
  }

  for (var groupName in items) {
    console.log('================================================');
    for (var artefactName in items[groupName]) {
      console.log(items[groupName][artefactName], artefactName, groupName);
    }
  }
};

// Ask user to type in console Game.Planets.debugDump()
Game.Planets.debugImportCosmos = function(userId, planets, spaceEvents) {
  // clear cosmos + queue
  Game.Planets.Collection.remove({ userId });
  Space.collection.remove({ 'data.userId': userId });

  // import planets
  var i = 0;
  for (i = 0; i < planets.length; i++) {
    var planet = planets[i];
    delete planet._id;
    planet.userId = userId;
    Game.Planets.Collection.insert(planet);
  }

  // calculate oldest space event time delta
  var curTime = Game.getCurrentTime();
  var minTime = Number.MAX_VALUE;
  for (i = 0; i < spaceEvents.length; i++) {
    if (spaceEvents[i].timeStart < minTime) {
      minTime = spaceEvents[i].timeStart;
    }
  }

  var deltaTime = curTime - minTime;

  // import space events
  for (i = 0; i < spaceEvents.length; i++) {
    var event = spaceEvents[i];
    delete event._id;
    event.timeStart += deltaTime;
    event.timeEnd += deltaTime;
    event.data.userId = userId;
    Space.collection.insert(event);
  }
};

if (process.env.NODE_ENV == 'development') {
  Meteor.methods({
    'debug.importCosmos': function(planets, spaceEvents) {
      Game.Planets.debugImportCosmos(Meteor.userId(), planets, spaceEvents);
    }
  });
}

};