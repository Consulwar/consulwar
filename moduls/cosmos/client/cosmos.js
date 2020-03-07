import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';

import Space from '/imports/modules/Space/client/space';
import Utils from '/imports/modules/Space/lib/utils';
import calcAttackOptions from '/imports/modules/Space/lib/calcAttackOptions';
import FlightEvents from '/imports/modules/Space/client/flightEvents';
import BattleEvents from '/imports/modules/Space/client/battleEvents';

import PlanetGeneration from '/imports/modules/Space/lib/planetGeneration';

import PathView from '/imports/modules/Space/client/PathView';
import Ship from '/imports/modules/Space/client/Ship';
import BattleIcon from '/imports/modules/Space/client/BattleIcon';
import Galaxy from '/imports/modules/Space/client/Galaxy';
import Hex from '/imports/modules/MutualSpace/lib/Hex';
import Config from '/imports/modules/Space/client/config';

import unitItems from '/imports/content/Unit/client';
import humanSpaceUnits from '/imports/content/Unit/Human/Space/client';
import reptileSpaceUnits from '/imports/content/Unit/Reptile/Space/client';

import '/imports/client/ui/blocks/Units/Units';

import mutualSpaceCollection from '/imports/modules/MutualSpace/lib/collection';
import Battle from '../../battle/lib/imports/battle';
import BattleCollection from '../../battle/lib/imports/collection';

import SpacePlanetPopup from '/imports/client/ui/blocks/Space/Planet/Popup/SpacePlanetPopup';
import SpaceFleetPopup from '/imports/client/ui/blocks/Space/FleetPopup/SpaceFleetPopup';
import SpaceBattlePopup from '/imports/client/ui/blocks/Space/BattlePopup/SpaceBattlePopup';

import '/imports/client/ui/blocks/Units/Reinforcement/UnitsReinforcement';
import '/imports/client/ui/blocks/Units/Power/UnitsPower';

import SpaceHistory from '/imports/client/ui/blocks/Space/History/SpaceHistory';

import '/imports/client/ui/blocks/Space/Planet/SpacePlanet';

const {
  calcDistance,
  calcDistanceByTime,
  calcFlyTime,
  calcTotalTimeByDistance,
  calcMaxSpeed,
  calcAcceleration,
} = Utils;

const {
  calcSegmentRandomPoints,
  calcSegmentPlanetsAmount,
} = PlanetGeneration;

initCosmosClient = function() {
'use strict';

initCosmosLib();

initCosmosContentClient();
let spaceEventsSubscription = Meteor.subscribe('mySpaceEvents');
Meteor.subscribe('myPlanets');
Meteor.subscribe('battles');
Meteor.subscribe('spaceHex');

Tracker.autorun((userPlanetsTracker) => {
  const user = Meteor.user();
  if (user) {
    userPlanetsTracker.stop();
    Meteor.setTimeout(() => Meteor.subscribe('planets', user.username));
  }
});

var isLoading = new ReactiveVar(false);
var zoom = new ReactiveVar(null);
var bounds = new ReactiveVar(null);
var isFleetSendInProgress = new ReactiveVar(false);
var updated = new ReactiveVar(null);

var mapView = null;
var pathViews = {};
var observerSpaceEvents = null;
var cosmosPopupView = null;
var selectedArtefact = new ReactiveVar(null);
var isPopupLocked = new ReactiveVar(false);

var activeSquad = new ReactiveVar(null);
var selectedUnits = new ReactiveVar(null);

let planetsLayer = null;
let pathsLayer = null;
let shipsLayer = null;
let galaxyByUsername = {};
let galaxyByHex = {};
let myAllies = [];

const selectAllUnits = new ReactiveVar(false);
const isSelectedAll = new ReactiveVar(false);

Space.collection.find({}).observe({
  added: function(event) {
    if (spaceEventsSubscription.ready()) {
      showNotificationFromSpaceEvent(event);
    }
  },

  removed: function(event) {
    event.status = 'completed';
    showNotificationFromSpaceEvent(event);
  }
});

var debounceDesktopNotification = _.debounce(function () {
  Game.showDesktopNotification(...arguments);
}, 1000, true);

var showNotificationFromSpaceEvent = function(event) {
  if (!event || !event.data) {
    return;
  }
  var options = {};
  var targetPlanet = Game.Planets.Collection.findOne({ _id: event.data.targetId });

  if (event.data.mission && targetPlanet && event.status !== 'completed' && event.status !== 'cancelled') {
    options.path = Router.path('cosmos', {group: 'cosmos'}, {hash: event._id});

    if (event.data.mission.type == 'tradefleet') {
      debounceDesktopNotification('Консул, смотрите, караван!', options);
    } else {
      if (!targetPlanet.mission && (targetPlanet.userId === Meteor.userId() || targetPlanet.minerUsername === Meteor.user().username)) {
        Game.showDesktopNotification('Консул, вашу колонию атакуют!', options);
      }
    }
  }

  if (!event.data.mission && !event.data.battleId && event.data.userId === Meteor.userId() && event.status === 'completed') {
    options.path = Router.path(
      'cosmos',
      { group: 'cosmos' },
      { hash: ((targetPlanet && targetPlanet._id) || event._id) },
    );

    debounceDesktopNotification('Консул, ваш флот долетел!', options);
  }
};

Game.Cosmos.showPage = function() {
  // clear content
  this.render('empty', { to: 'content' });
  this.render('empty', { to: 'bottomMenu' });
  // show permanent content div
  $('.permanent').show();
  // render cosmos map once
  if (!mapView) {
    isLoading.set(true);
    this.render('cosmos', { to: 'permanent_content' });
  } else {
    Meteor.setTimeout(function() {
      mapView.zoomIn();
      mapView.zoomOut();
      mapView.invalidateSize();
    }, 100);
  }
};

// ----------------------------------------------------------------------------
// Cosmos battle history
// ----------------------------------------------------------------------------

Game.Cosmos.showHistory = function() {
  Game.Popup.show({
    template: SpaceHistory.renderComponent(),
    data: { isEarth: false },
    hideClose: true,
  });
}

// ----------------------------------------------------------------------------
// Fleets side menu
// ----------------------------------------------------------------------------

const scrollMapToPlanet = function(id) {
  const planet = Game.Planets.getOne(id);
  const offset = galaxyByUsername[planet.username].offset;
  if (planet) {
    mapView.setView([offset.x + planet.x, offset.y + planet.y], 7);
  }
};

const scrollMapToBattle = function(id) {
  const battleEvent = BattleEvents.findByBattleId(id);
  if (battleEvent) {
    const hex = battleEvent.data.targetHex;
    const offset = ((galaxyByHex[hex.x] || {})[hex.z] || {}).offset;
    if (offset) {
      mapView.setView([
        offset.x + battleEvent.data.targetPosition.x,
        offset.y + battleEvent.data.targetPosition.y,
      ], 7);
    }
  }
};

var scrollMapToFleet = function(id) {
  var path = pathViews[id];
  var spaceEvent = FlightEvents.getOne(id);

  if (path && spaceEvent) {
    var totalFlyDistance = calcDistance(
      spaceEvent.data.startPosition,
      spaceEvent.data.targetPosition,
    );

    const currentDistance = calcDistanceByTime(
      Session.get('serverTime') - Game.dateToTime(spaceEvent.created),
      totalFlyDistance,
      calcMaxSpeed(spaceEvent.data.engineLevel),
      calcAcceleration(spaceEvent.data.engineLevel),
    );

    const k = currentDistance / totalFlyDistance;
    const position = path.getPointAlongDistanceByCoef(k);

    mapView.setView([position.x, position.y], 8);
  }
};

Template.cosmosFleetsInfo_table.helpers({
  getTimeLeft: function(timeEnd) {
    var timeLeft = timeEnd - Session.get('serverTime');
    return timeLeft > 0 ? timeLeft : 0;
  },

  percentOfWay: function(timeStart, timeEnd) {
    var total = timeEnd - timeStart;
    var timeLeft = Session.get('serverTime') - timeStart;

    return Math.floor((timeLeft / total) * 100);
  }
});

Template.cosmosFleetsInfo_table.events({
  'mouseover .cw--FleetInfoPlanets__marker, mouseover .cw--FleetInfoPlanets__planet_end .cw--FleetInfoPlanets__fleetReptiles': function (e, t) {
    const tooltip = new SpaceFleetPopup({
      hash: {
        spaceEvent: this.spaceEvent,
      },
    }).renderComponentToHTML();
    $(e.currentTarget).attr('data-tooltip', tooltip);
  },

  'mouseover .planet': function (e, t) {
    let tooltip = '';

    if (this.isDisabled) {
      tooltip = 'Недоступна для выбора';
    } else if (this.planet.isEmpty) {
      if (this.isSent) {
        tooltip = 'Флот в полёте';
      } else {
        tooltip = 'Свободная колония';
      }
    } else if (this.planet.notAvaliable) {
      if (this.planet.canBuy) {
        tooltip = 'Можно купить';
      } else {
        tooltip = 'Доступна с повышением ранга';
      }
    } else {
      tooltip = new SpacePlanetPopup({
        hash: {
          planet: this.planet,
        },
      }).renderComponentToHTML();
    }

    $(e.currentTarget).attr('data-tooltip', tooltip);
  }
});

Template.cosmosFleetsInfo.helpers({
  userFleets: function () {
    var result = [];

    var i = 0;
    var data = null;

    var fleets = FlightEvents.getFleetsEvents().fetch();
    for (i = 0; i < fleets.length; i++) {
      if (!fleets[i].data.isHumans) {
        continue;
      }
      data = {
        id: fleets[i]._id,
        spaceEvent: fleets[i],
        start: Game.Planets.getOne(fleets[i].data.startPlanetId),
        finish: Game.Planets.getOne(fleets[i].data.targetId),
        timeStart: Game.dateToTime(fleets[i].created),
        timeEnd: Game.dateToTime(fleets[i].after),
        isBack: fleets[i].data.isBack,
      };
      if (data.start) {
        data.start.owner = data.start.mission 
          ? 'reptiles' 
          : data.start.armyId || data.start.isHome 
            ? 'humans' 
            : null;
      }
      
      if (data.finish) {
        data.finish.owner = data.finish.mission 
          ? 'reptiles' 
          : data.finish.armyId || data.finish.isHome 
            ? 'humans' 
            : null;

        if (fleets[i].data.isOneway) {
          data.name = data.finish.mission ? 'Захватить' : 'Перелёт';
        } else {
          data.name = data.finish.mission ? 'Уничтожить' : 'Исследовать';
        }

        if (data.finish.mission) {
          data.name += (
            ' ' + Game.Battle.items[data.finish.mission.type].name 
            + ' ' + data.finish.mission.level
          );
        }
      } else if (fleets[i].data.targetType === FlightEvents.TARGET.BATTLE) {
        data.name = 'Подкрепление';
      } else {
        data.name = 'Перехват';
        const target = FlightEvents.getOne(fleets[i].data.targetId);
        if (target) {
          data.name += (
            ' ' + Game.Battle.items[target.data.mission.type].name
            + ' ' + target.data.mission.level
          );
        }
      }

      result.push(data);
    }

    return (result.length > 0) ? result : null;
  },

  reptileFleets: function () {
    var result = [];
    var fleets = FlightEvents.getFleetsEvents().fetch();
    for (var i = 0; i < fleets.length; i++) {
      if (fleets[i].data.isHumans) {
        continue;
      }
      var data = {
        id: fleets[i]._id,
        spaceEvent: fleets[i],
        start: Game.Planets.getOne(fleets[i].data.startPlanetId),
        finish: Game.Planets.getOne(fleets[i].data.targetId),
        timeStart: Game.dateToTime(fleets[i].created),
        timeEnd: Game.dateToTime(fleets[i].after),
        isBack: fleets[i].data.isBack,
      };
      
      if (data.start) {
        data.start.owner = data.start.mission 
          ? 'reptiles' 
          : data.start.armyId || data.start.isHome 
            ? 'humans' 
            : null;
      }
      
      if (data.finish) {
        data.finish.owner = data.finish.mission 
          ? 'reptiles' 
          : data.finish.armyId || data.finish.isHome 
            ? 'humans' 
            : null;
      }

      data.name = Game.Battle.items[fleets[i].data.mission.type].name + ' ' +
        fleets[i].data.mission.level;

      result.push(data);
    }
    return (result.length > 0) ? result : null;
  },

  battles() {
    const result = [];

    const battles = BattleCollection.find({
      status: Battle.Status.progress,
      userNames: Meteor.user().username,
    }).fetch();

    battles.forEach((battle) => {
      const battleEvent = Space.collection.findOne({
        'data.battleId': battle._id
      });

      if (battleEvent) {
        result.push({
          id: battle._id,
          round: battleEvent.repeated + 1,
          secondsLeft: battleEvent,
        });
      }
    });

    return (result.length > 0) ? result : null;
  },
});

// ----------------------------------------------------------------------------
// Planet side menu
// ----------------------------------------------------------------------------

Game.Cosmos.showPlanetInfo = function(id, offset) {
  Game.Cosmos.showPlanetPopup(id, true, offset);
};

// ----------------------------------------------------------------------------
// Planets popup
// ----------------------------------------------------------------------------

Game.Cosmos.showPlanetPopup = function(id, isLock, offset = { x: 0, y: 0 }) {
  if (!mapView) {
    return;
  }

  var planet = Game.Planets.getOne(id);

  Game.Cosmos.hidePlanetPopup();

  if (isLock) {
    isPopupLocked.set(true);
  }

  cosmosPopupView = Blaze.render(
    new SpacePlanetPopup({
      hash: {
        planet: planet,
        isMapView: true,
        allowEdit: isLock,
        allowActions: isLock,
        position: function() {
          const k = Math.pow(2, (zoom.get() - 7));
          const iconSize = (planet.size + 3) * 4;
          const position = mapView.latLngToLayerPoint(
            new L.latLng(offset.x + planet.x, offset.y + planet.y),
          );
          position.x += 24 + 10 + Math.round(iconSize * k / 2);
          position.y -= 85;
          return position;
        },
      },
    }).renderComponent(),
    $('.leaflet-popup-pane')[0],
  );
};

Game.Cosmos.showBattlePopup = function(battleId, isLock, offset = { x: 0, y: 0 }) {
  if (!mapView) {
    return;
  }

  const battleEvent = BattleEvents.findByBattleId(battleId);
  if (!battleEvent) {
    return;
  }

  Game.Cosmos.hidePlanetPopup();

  if (isLock) {
    isPopupLocked.set(true);
  }

  cosmosPopupView = Blaze.render(
    new SpaceBattlePopup({
      hash: {
        battleId,
        position: function() {
          const k = Math.pow(2, (zoom.get() - 7));
          const iconSize = 6;
          const position = mapView.latLngToLayerPoint(
            new L.latLng(
              offset.x + battleEvent.data.targetPosition.x,
              offset.y + battleEvent.data.targetPosition.y,
            ),
          );
          position.x += 24 + 10 + Math.round((iconSize * k) / 2);
          return position;
        },
      },
    }).renderComponent(),
    $('.leaflet-popup-pane')[0],
  );
};

Game.Cosmos.hidePlanetPopup = function() {
  if (cosmosPopupView) {
    Blaze.remove( cosmosPopupView );
    cosmosPopupView = null;
  }
  isPopupLocked.set(false);
};

// ----------------------------------------------------------------------------
// Ship side menu
// ----------------------------------------------------------------------------

Game.Cosmos.showShipInfo = function(id, isLock) {
  Game.Cosmos.hidePlanetPopup();

  if (isLock) {
    isPopupLocked.set(true);
  }

  var spaceEvent = FlightEvents.getOne(id);

  if (spaceEvent) {
    cosmosPopupView = Blaze.render(
      new SpaceFleetPopup({
        hash: {
          spaceEvent: spaceEvent,
          allowActions: isLock,
          isMapView: true,
          position: function() {
            const startPosition = this.spaceEvent.data.startPosition;
            const targetPosition = this.spaceEvent.data.targetPosition;
            const startPositionWithOffset = { ...startPosition };
            const targetPositionWithOffset = { ...targetPosition };
            if (this.spaceEvent.data.hex) {
              let center = new Hex(this.spaceEvent.data.hex).center();
              startPositionWithOffset.x += center.x;
              startPositionWithOffset.y += center.y;

              center = new Hex(this.spaceEvent.data.targetHex).center();
              targetPositionWithOffset.x += center.x;
              targetPositionWithOffset.y += center.y;
            }

            const pos = getFleetAnimation({
              spaceEvent: this.spaceEvent,
              maxSpeed: calcMaxSpeed(this.spaceEvent.data.engineLevel),
              acceleration: calcAcceleration(this.spaceEvent.data.engineLevel),
              totalFlyDistance: calcDistance(
                startPositionWithOffset,
                targetPositionWithOffset,
              ),
            }, mapView, pathViews[this.spaceEvent._id]);
            return {
              x: pos.x + 50,
              y: pos.y - 50,
            };
          },
        },
      }).renderComponent(),
      $('.leaflet-popup-pane')[0],
    );
  }
};

Game.Cosmos.getReinforcementInfo = function(spaceEvent) {
  if (!spaceEvent || spaceEvent.status === 'completed' || spaceEvent.status === 'cancelled') {
    return null;
  }

  var info = {};

  info.name = null;
  info.id = spaceEvent._id;
  info.isHumans = true;
  info.canSend = false;
  info.status = 'Подкрепление';

  var units = spaceEvent.data.units;
  if (units) {
    info.units = [];
    _(units).pairs().forEach(([id, count]) => {
      info.units.push({
        id,
        title: unitItems[id].title,
        count,
      });
    });
  }

  return info;
};

// ----------------------------------------------------------------------------
// Attack menu
// ----------------------------------------------------------------------------
var activeColonyId = new ReactiveVar(null);

var getSourcePlanets = function() {
  const maxCount = Game.Planets.getMaxColoniesCount();
  const colonies = Game.Planets.getColonies();
  const planetsWithFleet = Game.Planets.getPlanetsWithArmy();
  const result = [...colonies];

  const ids = {};
  colonies.forEach((colony) => {
    ids[colony._id] = true;
  });

  // sort colonies by name, but home planet always first
  result.sort(function(a, b) {
    if (a.isHome) {
      return -1;
    }
    if (b.isHome) {
      return 1;
    }
    return (a.name < b.name) ? -1 : 1;
  });

  for (let i = result.length; i < maxCount; i += 1) {
    result.push({
      isEmpty: true,
      size: Game.Random.interval(2, 5),
      type: _.sample(_.toArray(Game.Planets.types)).engName,
    });
  }

  const possibleBuyPlanets = Game.Planets.MAX_EXTRA_COLONIES - Game.Planets.getExtraColoniesCount();
  let buyPlanetNumber = 0;
  const purchasedPlanets = Game.Planets.getExtraColoniesCount();
  let requiredRank = Game.User.getLevel();

  for (let i = result.length; i < 20; i += 1) {
    if (buyPlanetNumber >= possibleBuyPlanets) {
      requiredRank += 1;
    }
    result.push({
      notAvaliable: true,
      canBuy: buyPlanetNumber < possibleBuyPlanets,
      requiredRank: buyPlanetNumber >= possibleBuyPlanets
        ? requiredRank
        : null,
      price: buyPlanetNumber < possibleBuyPlanets
        ? Game.Planets.getExtraColonyPrice(
          purchasedPlanets + buyPlanetNumber,
        )
        : null,
      size: Game.Random.interval(2, 5),
      type: _.sample(_.toArray(Game.Planets.types)).engName
    });
    buyPlanetNumber += 1;
  }

  planetsWithFleet.sort(function(a, b) {
    return (a.name < b.name) ? -1 : 1;
  });

  planetsWithFleet.forEach((planet) => {
    if (!ids[planet._id]) {
      result.push(planet);
    }
  });

  return result;
}

var resetColonyId = function(targetPlanetId) {
  const sourcePlanetsWithArmy = getSourcePlanets().filter(planet => planet.armyUsername === Meteor.user().username);

  if (sourcePlanetsWithArmy.length > 1) {
    for (let i = 0; i < sourcePlanetsWithArmy.length; i++) {
      // Change selected colony if it is selected
      if (sourcePlanetsWithArmy[i]._id === targetPlanetId && targetPlanetId === activeColonyId.get()) {
        activeColonyId.set( sourcePlanetsWithArmy[i > 0 ? i - 1 : i + 1]._id );
        break;
      }
    }
  }

  if(!Game.Planets.getFleetUnits(activeColonyId.get())) {
    activeColonyId.set(Game.Planets.getBase()._id);
  }
};

Game.Cosmos.showAttackMenu = function(id) {
  resetColonyId(id);

  Router.current().render('cosmosAttackMenu', {
    to: 'cosmosAttackMenu',
    data: {
      id,
      activeColonyId,
      updated,
      activeSquad,
      selectedUnits,
      isSelectedAll,
      selectAllUnits,
    }
  });
};

Game.Cosmos.hideAttackMenu = function() {
  Router.current().render(null, {
    to: 'cosmosAttackMenu'
  });
};

var isAllSelected = function() {
  var units = selectedUnits.get();
  if (units) {
    var army = Game.Planets.getFleetUnits(activeColonyId.get());
    if (!army) {
      return true;
    }
    for (let unitName in army) {
      if (units[unitName] != army[unitName]) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};

var resetSelectedUnits = function() {
  var units = {};
  var squad = activeSquad.get();
  _(humanSpaceUnits).keys().forEach((id) => {
    if (squad && squad.units && squad.units[id]) {
      units[id] = squad.units[id];
    } else {
      units[id] = 0;
    }
  });
  selectedUnits.set(units);
};
resetSelectedUnits();

var timeAttack = function(id) {
  var baseId = id || Template.instance().data.activeColonyId.get();
  var basePlanet = Game.Planets.getOne(baseId);
  if (!basePlanet) {
    return null;
  }
  const baseGalaxy = galaxyByUsername[basePlanet.username];
  const basePosition = {
    x: basePlanet.x + baseGalaxy.offset.x,
    y: basePlanet.y + baseGalaxy.offset.y,
  };

  var targetId = Template.instance().data.id;
  var engineLevel = Game.Planets.getEngineLevel(Meteor.user());

  var targetPlanet = Game.Planets.getOne(targetId);
  if (targetPlanet) {
    const targetGalaxy = galaxyByUsername[targetPlanet.username];
    const targetPosition = {
      x: targetPlanet.x + targetGalaxy.offset.x,
      y: targetPlanet.y + targetGalaxy.offset.y,
    };
    return calcFlyTime(basePosition, targetPosition, engineLevel);
  }

  var targetShip = FlightEvents.getOne(targetId);
  if (targetShip) {
    var result = calcAttackOptions({
      attackerPosition: basePosition,
      attackerEngineLevel: engineLevel,
      targetShip,
      timeCurrent: Session.get('serverTime'),
    });
    return (result) ? result.time : null;
  }

  return null;
};

const timeAttackBattle = function(id) {
  const baseId = id || Template.instance().data.activeColonyId.get();
  const basePlanet = Game.Planets.getOne(baseId);
  if (!basePlanet) {
    return null;
  }
  const baseGalaxy = galaxyByUsername[basePlanet.username];
  const basePosition = {
    x: basePlanet.x + baseGalaxy.offset.x,
    y: basePlanet.y + baseGalaxy.offset.y,
  };

  const targetId = Template.instance().data.id;
  const engineLevel = Game.Planets.getEngineLevel(Meteor.user());

  const targetBattle = BattleEvents.findByBattleId(targetId);
  if (targetBattle) {
    let targetOffset = { x: 0, y: 0 };
    if (targetBattle.data.targetHex) {
      const targetHex = new Hex(targetBattle.data.targetHex);
      targetOffset = targetHex.center();
    }
    const targetPosition = {
      x: targetBattle.data.targetPosition.x + targetOffset.x,
      y: targetBattle.data.targetPosition.y + targetOffset.y,
    };
    return calcFlyTime(basePosition, targetPosition, engineLevel);
  }

  return null;
};

const units = [];

Template.cosmosAttackMenu.onRendered(function() {
  setTimeout(function() {
    $('.content .attack-menu .scrollbar-inner').perfectScrollbar();
  });
});

Template.cosmosAttackMenu.helpers({
  battle() {
    return BattleEvents.findByBattleId(this.id);
  },

  ship: function() {
    return FlightEvents.getOne(this.id);
  },

  planet: function() {
    return Game.Planets.getOne(this.id);
  },

  timeAttack: timeAttack,

  timeAttackBattle: timeAttackBattle,

  vacantFleets: function () {
    return Space.getMaxArmyCount() - Space.getCurrentArmyCount();
  },

  timeLeft: function() {
    var targetId = this.id;
    var targetShip = FlightEvents.getOne(targetId);
    if (targetShip) {
      return Game.dateToTime(targetShip.after) - Session.get('serverTime');
    }

    return null;
  },

  activeColonyId: function() {
    return Template.instance().data.activeColonyId.get();
  },

  activeSquad: function() {
    return Template.instance().data.activeSquad.get();
  },

  canHaveMoreColonies: function() {
    var updated = this.updated.get(); // rerun this helper on units update
    var targetId = this.id;

    var baseId = this.activeColonyId.get();
    var basePlanet = Game.Planets.getOne(baseId);
    if (!basePlanet) {
      return false;
    }

    // check is we leaving base
    var isLeavingBase = false;

    if (!basePlanet.isHome) {
      // base planet is not home, so we can leave it
      isLeavingBase = true;
      // test selected units vs available units
      if (!isAllSelected()) {
        isLeavingBase = false;
      }
    }

    return Game.Planets.checkCanHaveMoreColonies(baseId, isLeavingBase, targetId);
  },

  canSendFleet() {
    return Space.checkSendFleet({
      planet: Game.Planets.getOne(activeColonyId.get()),
      units: selectedUnits.get(),
    }) && !isFleetSendInProgress.get();
  },

  extraColonyPrice: function() {
    return Game.Planets.getExtraColonyPrice();
  },

  canHaveMoreExtraColonies: function() {
    return Game.Planets.getExtraColoniesCount() < Game.Planets.MAX_EXTRA_COLONIES;
  },

  hasArmy(colony) {
    return colony.armyUsername === Meteor.user().username;
  },

  colonies: function() {
    const result = getSourcePlanets();

    for (let i = 0; i < result.length; i += 1) {
      result[i].timeAttack = timeAttack(result[i]._id);
    }

    _.chain(result)
      .filter(item => item.armyUsername == Meteor.user().username)
      .sortBy(item => (item.timeAttack ? item.timeAttack : Infinity))
      .first(3)
      .each(function(item) {
        if (item.timeAttack) {
          item.isTopTime = true;
        }
      });

    return result;
  },

  toggleSelectAllUnits() {
    selectAllUnits.set(!selectAllUnits.get());
  },

  squads: function() {
    var hasPremium = Game.hasPremium();

    var squads = [];

    while(squads.length < Game.Squad.config.slots.total) {
      let slot = squads.length + 1;
      let squad = Game.Squad.getOne(slot);
      if (squad) {
        squads.push(squad);
      } else {
        let squad = {
          slot
        };
        if (squad.slot <= Game.Squad.config.slots.free || Game.hasPremium()) {
          squad.name = 'Отряд ' + slot;
        }
        squads.push(squad);
      }
    }

    return _.map(squads, function(squad) {
      if (squad.slot > Game.Squad.config.slots.free && !Game.hasPremium()) {
        squad.noPremium = true;
        squad.units = null;
      }

      return squad;
    });
  },

  closeWindow() {
    Game.Cosmos.hideAttackMenu();
  }
});

Template.cosmosAttackMenu.events({
  'click .resources .credits': function(e, t) {
    Game.Payment.showWindow();
  },
  
  'click .cw--SpacePlanet_canBuy': function(e, t) {
    var price = Game.Planets.getExtraColonyPrice();

    Game.showAcceptWindow('Дополнительная колония стоит ' + price + ' ГГК. Купить?', function() {
      var userResources = Game.Resources.getValue();
      if (userResources.credits.amount < price) {
        Notifications.error('Недостаточно ГГК');
        return;
      }

      Meteor.call('planet.buyExtraColony', function(err) {
        if (err) {
          Notifications.error('Не удалось купить дополнительную колонию', err.error);
        }
      });
    });
  },

  'click .planets a': function(e, t) {
    e.preventDefault();
    var id = $(e.currentTarget).attr("data-id");
    let planet = Game.Planets.getOne(id);
    if (
      id
      && planet.armyUsername == Meteor.user().username
      && !$(e.currentTarget).hasClass('cw--SpacePlanet_disabled')
    ) {
      resetSelectedUnits();

      // set new colony id
      t.data.activeColonyId.set( id );
    }
  },

  'click .btn-attack': function(e, t) {
    var isOneway = $(e.currentTarget).hasClass('defend');

    var baseId = t.data.activeColonyId.get();
    var basePlanet = Game.Planets.getOne(baseId);

    if (!basePlanet) {
      Notifications.info('Не выбрана базовая планета');
      return;
    }

    var total = 0;
    var selected = selectedUnits.get();
    var units = {};

    for (let engName in selected) {
      if (selected[engName] > 0) {
        units[engName] = selected[engName];
        total += selected[engName];
      }
    }

    if (total <= 0) {
      Notifications.info('Выберите корабли для отправки');
      return;
    }

    var targetId = t.data.id;
    var planet = Game.Planets.getOne(targetId);
    var ship = FlightEvents.getOne(targetId);
    const battle = BattleEvents.findByBattleId(targetId);

    if (!planet && !ship && !battle) {
      Notifications.info('Не выбрана цель');
      return;
    }

    if (planet) {
      // Send to planet
      isFleetSendInProgress.set(true);
      Meteor.call(
        'space.sendFleet',
        basePlanet._id,
        FlightEvents.TARGET.PLANET,
        targetId,
        units,
        isOneway,
        function(err) {
          isFleetSendInProgress.set(false);

          if (err) {
            Notifications.error('Не удалось отправить флот', err.error);
          } else {
            Notifications.success('Флот отправлен');
            Game.Cosmos.hideAttackMenu();
            resetColonyId();
          }
        }
      );
    } else if (battle) {
      // Send to battle
      isFleetSendInProgress.set(true);
      Meteor.call(
        'space.sendFleet',
        basePlanet._id,
        FlightEvents.TARGET.BATTLE,
        targetId,
        units,
        isOneway,
        function(err) {
          isFleetSendInProgress.set(false);

          if (err) {
            Notifications.error('Не удалось отправить флот', err.error);
          } else {
            Notifications.success('Флот отправлен');
            Game.Cosmos.hideAttackMenu();
            resetColonyId();
          }
        },
      );
    } else if (ship) {
      // Attack ship
      var pathView = pathViews[ship._id];
      var engineLevel = Game.Planets.getEngineLevel(Meteor.user());

      const baseGalaxy = galaxyByUsername[basePlanet.username];
      const basePosition = {
        x: basePlanet.x + baseGalaxy.offset.x,
        y: basePlanet.y + baseGalaxy.offset.y,
      };

      var attack = calcAttackOptions({
        attackerPosition: basePosition,
        attackerEngineLevel: engineLevel,
        targetShip: ship,
        timeCurrent: Session.get('serverTime'),
      });

      if (!attack || !pathView) {
        Notifications.info('Невозможно перехватить вражеский флот');
        return;
      }

      isFleetSendInProgress.set(true);
      Meteor.call(
        'space.attackReptileFleet',
        basePlanet._id,
        targetId,
        units,
        function(err) {
          isFleetSendInProgress.set(false);
          
          if (err) {
            Notifications.error('Не удалось отправить флот', err.error);
          } else {
            Notifications.success('Флот отправлен');
            //Game.Cosmos.showFleetsInfo();
            Game.Cosmos.hideAttackMenu();
            resetColonyId();
          }
        }
      );
    }
  },

  'click .squad:not(.noPremium)': function(e, t) {
    var slot = parseInt(e.currentTarget.dataset.id, 10);
    var squad = activeSquad.get();

    if (squad && squad.slot == slot) {
      activeSquad.set(null);
    } else {
      activeSquad.set(Game.Squad.getOne(slot) || {
        slot,
        name: 'Отряд ' + slot
      });
    }
    resetSelectedUnits();
  },

  'click .squad:not(.noPremium) img': function(e, t) {
    var slot = parseInt(e.currentTarget.parentElement.dataset.id, 10);
    let squad = Game.Squad.getOne(slot) || {name: 'Отряд ' + slot};

    Game.Icons.showSelectWindow(function(group, name) {
      var message = 'Сменить иконку отряда «' + squad.name + '»';

      Game.showAcceptWindow(message, function() {
        Meteor.call('squad.setIcon', {slot, group, name}, function(err, result) {
          if (err) {
            Notifications.error('Не удалось выбрать иконку', err.error);
          } else {
            Notifications.success('Вы поменяли иконку');
            Game.Icons.closeSelectWindow();
          }
        });
      });
    }, function(group, id) {
      if (squad.icon == group + '/' + id) {
        return true;
      }
      return false;
    });
  },

  'click .squad:not(.noPremium) .edit': function(e, t) {
    var slot = parseInt(e.currentTarget.parentElement.parentElement.dataset.id, 10);
    var squad = Game.Squad.getOne(slot) || {name: 'Отряд ' + slot};

    Game.showInputWindow('Как назвать отряд?', squad.name, function(name) {
      Meteor.call('squad.setName', {slot, name}, function(err, result) {
        if (err) {
          Notifications.error('Не удалось изменить имя отряда', err.error);
        } else {
          Notifications.success('Вы изменили имя отряда');
        }
      });
    });
  },

  'click .squads .control .save': function(e, t) {
    var squad = activeSquad.get();
    if (squad) {
      Game.showAcceptWindow('Сохранить отряд «' + squad.name + '»?', function() {
        var units = selectedUnits.get();

        Meteor.call('squad.setUnits', {slot: squad.slot, units}, function(err, result) {
          if (err) {
            Notifications.error('Не удалось изменить состав отряда', err.error);
          } else {
            Notifications.success('Вы изменили состав отряда');
          }
        });
      });
    }
  },

  'click .squads .control .link': function(e, t) {

  },

  'click .squads .control .remove': function(e, t) {
    var squad = activeSquad.get();

    if (squad) {
      Game.showAcceptWindow('Удалить отряд «' + squad.name + '»?', function() {
        Meteor.call('squad.remove', {slot: squad.slot}, function(err, result) {
          if (err) {
            Notifications.error('Не удалось удалить отряда', err.error);
          } else {
            Notifications.success('Вы удалили отряд');
          }
        });
      });
    }
  }
});

// ----------------------------------------------------------------------------
// Cosmos map content
// ----------------------------------------------------------------------------

const getFleetAnimation = function(fleet, mapView, path) {
  // eslint-disable-next-line meteor/no-session
  const currentTime = Session.get('serverTime');

  if (!path) {
    return {
      x: 0,
      y: 0,
      angle: 0,
    };
  }

  const currentDistance = calcDistanceByTime(
    currentTime - Game.dateToTime(fleet.spaceEvent.created),
    fleet.totalFlyDistance,
    fleet.maxSpeed,
    fleet.acceleration,
  );

  const k = currentDistance / fleet.totalFlyDistance;
  const curPoint = path.getPointAlongDistanceByCoef(k);

  let nextPoint = fleet.spaceEvent.data.targetPosition;
  if (k < 0.99) {
    nextPoint = path.getPointAlongDistanceByCoef(k + 0.01);
  }
  const angleRad = Math.atan2(nextPoint.y - curPoint.y, nextPoint.x - curPoint.x);

  let angleDeg = Math.floor((angleRad * 180) / Math.PI);
  if (fleet.spaceEvent.data.isHumans) {
    angleDeg += 180;
  }

  const coords = mapView.latLngToLayerPoint(new L.LatLng(curPoint.x, curPoint.y));

  return {
    lat: curPoint.x,
    lng: curPoint.y,
    x: coords.x,
    y: coords.y,
    angle: angleDeg,
    angleRad,
  };
};

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

const showSpaceEvent = function(id, event, offset, user) {
  if (event.type === FlightEvents.EVENT_TYPE) {
    let fromOffset = offset;
    if (event.data.hex) {
      fromOffset = new Hex(event.data.hex).center();
    }
    let toOffset = offset;
    if (event.data.targetHex) {
      toOffset = new Hex(event.data.targetHex).center();
    } else if (event.data.hex) {
      toOffset = fromOffset;
    }

    createPath(id, event, fromOffset, toOffset, user);
    const ship = new Ship({
      isStatic: false,
      eventId: id,
      fleet: event,
      mapView,
      shipsLayer,
      path: pathViews[id],
      isPopupLocked,
      origin: fromOffset,
      user,
      myAllies,
    });
  } else if (event.type === BattleEvents.EVENT_TYPE) {
    let toOffset = offset;
    if (event.data.targetHex) {
      toOffset = new Hex(event.data.targetHex).center();
    } else if (event.data.hex) {
      toOffset = new Hex(event.data.hex).center();
    }

    new BattleIcon({
      battleEventId: id,
      battleEvent: event,
      mapView,
      origin: toOffset,
      shipsLayer,
    });
  }
};

const indexGalaxyHex = function(galaxy, hex) {
  const column = galaxyByHex[hex.x] = galaxyByHex[hex.x] || {};
  column[hex.z] = galaxy;
}

const viewGalaxy = function({ user, username = user.username, offset = { x: 0, y: 0 }, hex }) {
  let subscription = null;
  if (Meteor.user().username !== username) {
    subscription = Meteor.subscribe('planets', username, { onStop: (e) => Notifications.error(e.error) });
  }

  if (hex) {
    Meteor.subscribe('spaceEvents', hex);
  }

  const galaxy = new Galaxy({
    user,
    username,
    isPopupLocked,
    mapView,
    planetsLayer,
    shipsLayer,
    offset,
    myAllies,
    selectedArtefact,
    subscription,
  });

  galaxyByUsername[username] = galaxy;
  if (hex) {
    indexGalaxyHex(galaxy, hex);
  }

  return galaxy;
};

const initGalaxy = function() {
  const user = Meteor.user();

  const myAlliance = Game.Alliance.Collection.findOne({ name: user.alliance });
  if (myAlliance) {
    myAllies = myAlliance.participants;
  }

  const galaxyHex = mutualSpaceCollection.findOne({ username: user.username });

  let center = { x: 0, y: 0 };
  if (galaxyHex) {
    const hex = new Hex(galaxyHex);
    center = hex.center();
  }

  observerSpaceEvents = Space.collection.find({}).observeChanges({
    added: function(id, event) {
      showSpaceEvent(id, event, center, user);
    },

    removed: function(id) {
      removePath(id);
    }
  });

  if (galaxyHex) {
    loadHexes();
  } else {
    viewGalaxy({ user });
    isLoading.set(false);
  }

  const homePlanet = Game.Planets.getBase();
  if (homePlanet) {
    mapView.setView([
      center.x + homePlanet.x, center.y + homePlanet.y
    ], 7);
  }

  Tracker.autorun(() => {
    if (zoom.get() < 2) {
      mapView.getPane('planets').hidden = true;
    } else {
      mapView.getPane('planets').hidden = false;
    }
  });
};

// Paths
const createPath = function(id, event, offsetStart, offsetEnd, user) {
  if (!mapView || pathViews[id]) {
    return;
  }

  // draw path
  pathViews[id] = new PathView({
    layer: pathsLayer,
    startPoint: event.data.startPosition,
    endPoint: event.data.targetPosition,
    color: Ship.getColor(event.data, user, myAllies),
    offsetStart,
    offsetEnd,
  });
};

const removePath = function(id) {
  if (mapView && pathViews[id]) {
    pathViews[id].remove();
    delete pathViews[id];
  }
};

Template.cosmos.onRendered(function() {
  mapView = L.map('map-battle', {
    crs: L.CRS.Simple,
    zoomAnimation: false,
    zoomControl: false,
    doubleClickZoom: false,
    attributionControl: false,
    fadeAnimation: false,
    inertia: false,
    center: [0, 0],
    zoom: 7,
    minZoom: -10,
    maxZoom: 10,
  });
  window.mapView = mapView;

  planetsLayer = L.layerGroup().addTo(mapView);
  pathsLayer = L.layerGroup().addTo(mapView);
  shipsLayer = L.layerGroup().addTo(mapView);

  mapView.createPane('planets').style.zIndex = 394;

  mapView.createPane('hexesLayer5').style.zIndex = 395;
  mapView.createPane('hexesLayer4').style.zIndex = 396;
  mapView.createPane('hexesLayer3').style.zIndex = 397;
  mapView.createPane('hexesLayer2').style.zIndex = 398;
  mapView.createPane('hexesLayer1').style.zIndex = 399;

  Tracker.autorun(() => {
    const user = Meteor.user();
    if (
      user
      && user.settings
      && user.settings.options
      && user.settings.options.hideMutualHexes
    ) {
      mapView.getPane('hexesLayer5').hidden = true;
      mapView.getPane('hexesLayer4').hidden = true;
      mapView.getPane('hexesLayer3').hidden = true;
      mapView.getPane('hexesLayer2').hidden = true;
    } else {
      mapView.getPane('hexesLayer5').hidden = false;
      mapView.getPane('hexesLayer4').hidden = false;
      mapView.getPane('hexesLayer3').hidden = false;
      mapView.getPane('hexesLayer2').hidden = false;
    }
  });

  zoom.set(mapView.getZoom());
  mapView.on('zoomend', function() {
    zoom.set(mapView.getZoom());
  });

  bounds.set(mapView.getBounds());
  mapView.on('moveend', function() {
    bounds.set(mapView.getBounds());
  });

  initGalaxy();

  mapView.on('click', () => {
    Game.Cosmos.hidePlanetPopup();
  });

  // Scroll to space object on hash change
  this.autorun(function() {
    var hash = Router.current().getParams().hash;
    if (!isLoading.get() && hash) {
      zoom.dep.changed();
      Tracker.nonreactive(function() {
        if (Game.Artefacts.items[hash]) {
          // highlight planets by artefact
          selectedArtefact.set(hash);
        } else if (Game.Planets.getOne(hash)) {
          // select planet
          Game.Cosmos.showPlanetInfo(hash);
          scrollMapToPlanet(hash);
        } else if (BattleEvents.findByBattleId(hash)) {
          // select battle
          scrollMapToBattle(hash);
        } else {
          // select ship
          Game.Cosmos.showShipInfo(hash, true);
          scrollMapToFleet(hash);
        }
      });
    }
  });

  const user = Meteor.user();
  if (user && user.rating > 120000) {
    const mutualSpace = mutualSpaceCollection.find({ username: user.username });
    if (mutualSpace.count() === 0) {
      accessMutualSpace();
    }
  }
});

const loadHexes = function() {
  Meteor.call('mutualSpace.getHexes', (err, hexes) => {
    const user = Meteor.user();
    const planets = Game.Planets.Collection.find({}).fetch();

    const usernames = _.uniq(planets.map(planet => planet.username));
    const visibleUsernames = {};
    usernames.forEach((username) => {
      visibleUsernames[username] = true;
    });

    const battleEvents = BattleEvents.getAllByUserId(user._id).fetch();
    const visibleHexes = {};
    battleEvents.forEach((battleEvent) => {
      const hex = battleEvent.data.targetHex || battleEvent.data.hex;
      visibleHexes[`${hex.x}|${hex.z}`] = true;
    });

    showHexes({ user, hexes, visibleUsernames, visibleHexes });

    Meteor.subscribe('globalSpaceEvents');

    isLoading.set(false);
  });
};

const showHexes = function({ user, hexes, visibleUsernames = {}, visibleHexes = {} }) {
  const hideMutualHexes = (
    user
    && user.settings
    && user.settings.options
    && user.settings.options.hideMutualHexes
  );
  
  hexes.forEach((hexInfo) => {
    const visibleHex = (
      visibleUsernames[hexInfo.username] ||
      visibleHexes[`${hexInfo.x}|${hexInfo.z}`]
    );

    const isClickable = (
      hexInfo.username
      && hexInfo.username !== null
      && hexInfo.username !== user.username
      && !visibleHex
    );

    let color;
    let pane;

    if (hexInfo.username === user.username) {
      color = Config.colors.user;
      pane = 'hexesLayer1';
    } else if (hexInfo.username === null) {
      color = Config.colors.enemy;
      pane = 'hexesLayer4';
    } else if (hexInfo.username === undefined) {
      color = Config.colors.empty;
      pane = 'hexesLayer5';
    } else if (myAllies.indexOf(hexInfo.username) !== -1) {
      color = Config.colors.ally;
      pane = 'hexesLayer2';
    } else if(hexInfo.username === '✯ Совет Галактики ✯') {
      color = Config.colors.council;
      isClickable = false;
      pane = 'hexesLayer4';
    } else {
      color = Config.colors.other;
      pane = 'hexesLayer3';
    }

    if (hideMutualHexes && visibleHex) {
      pane = 'hexesLayer1';
    }

    const hex = new Hex(hexInfo);

    const hexPoly = L.polygon(hex.corners(), {
      fill: !visibleHex,
      color,
      pane,
      interactive: isClickable,
    }).addTo(mapView);

    if(hexInfo.username === '✯ Совет Галактики ✯') {
      return;
    }

    const center = hex.center();

    const loadHex = function() {
      viewGalaxy({
        user,
        username: hexInfo.username,
        offset: center,
        hex: {
          x: hex.x,
          z: hex.z,
        },
      });

      hexPoly.setStyle({ fill: false });
    };

    if (visibleHex || hexInfo.username === user.username) {
      loadHex();
    } else if (isClickable) {
      const usernameTooltip = L.tooltip({
        direction: 'center',
        className: 'usernameTooltip',
        permanent: true,
      })
        .setLatLng([center.x, center.y])
        .setContent(hexInfo.username);

      Tracker.autorun(() => {
        const user = Meteor.user();
        if (
          user
          && user.settings
          && user.settings.options
          && user.settings.options.hideMutualHexes
        ) {
          usernameTooltip.remove();
        } else {
          usernameTooltip.addTo(mapView);
        }
      });

      hexPoly.on('click', () => {
        loadHex();

        usernameTooltip.remove();
      });
    }
  });
};

Template.cosmos.onDestroyed(function() {
  // --------------------------------
  // Never destroy cosmos map!
  /*
  Game.Cosmos.hidePlanetPopup();
  Game.Cosmos.hideAttackMenu();

  if (observerSpaceEvents) {
    observerSpaceEvents.stop();
    observerSpaceEvents = null;
  }

  if (cosmosObjectsView) {
    Blaze.remove( cosmosObjectsView );
    cosmosObjectsView = null;
  }

  pathViews = {};

  if (mapView) {
    mapView.remove();
    mapView = null;
  }
  */
  // --------------------------------
});

Template.cosmos.helpers({
  possibleDesync: () => Session.get('possibleDesync'),

  isLoading: function() {
    return isLoading.get();
  },

  isSelection: function() {
    return selectedArtefact.get();
  },

  isMutualSpace: function() {
    return mutualSpaceCollection.findOne({ username: Meteor.user().username });
  }
});

const accessMutualSpace = function() {
  Meteor.call('mutualSpace.access', (err, hexes) => {
    if (err) {
      Notifications.error('Не удалось совершить выход в космос', err.error);
      return;
    }

    planetsLayer.clearLayers();
    pathsLayer.clearLayers();
    shipsLayer.clearLayers();

    L.DomUtil.empty(mapView.getPane('hexesLayer1'));
    L.DomUtil.empty(mapView.getPane('hexesLayer2'));
    L.DomUtil.empty(mapView.getPane('hexesLayer3'));
    L.DomUtil.empty(mapView.getPane('hexesLayer4'));
    L.DomUtil.empty(mapView.getPane('hexesLayer5'));

    const user = Meteor.user();
    const galaxy = galaxyByUsername[user.username];
    const userHex = _(hexes).find(hex => hex.username === user.username);
    const center = new Hex(userHex).center();
    indexGalaxyHex(galaxy, userHex);

    galaxy.reRender(center);

    Space.collection.find({}).fetch().forEach((event) => {
      removePath(event._id);
      showSpaceEvent(event._id, event, center, user);
    });

    showHexes({
      user,
      hexes,
      visibleUsernames: {
        [user.username]: true,
      },
    });

    mapView.setView([center.x, center.y], 2);
  });
};

Template.cosmos.events({
  'click .btn-selection': function(e, t) {
    selectedArtefact.set(null);
  },

  'click .map-control-home': function(e, t) {
    if (mapView) {
      const homePlanet = Game.Planets.getBase();
      if (homePlanet) {
        const galaxy = galaxyByUsername[Meteor.user().username];

        mapView.setView([
          galaxy.offset.x + homePlanet.x, galaxy.offset.y + homePlanet.y
        ], 7);
      } else {
        mapView.setView([0, 0], 7);
      }
    }
  },

  'click .btn-mutual-space'(e, t) {
    accessMutualSpace();
  },
});

// ------------------------------------------------------
// Debug methods
// ------------------------------------------------------

Game.Planets.debugDrawGalactic = function(hands, segments, rotation, narrow, min, max, radius, angle) {
  if (!mapView) {
    return;
  }

  mapView.eachLayer(function (layer) {
    mapView.removeLayer(layer);
  });

  var debugDrawSegment = function(hand, segment) {
    var amount = calcSegmentPlanetsAmount(hand, segment, hands, segments, min, max);
    var points = calcSegmentRandomPoints(amount, hand, segment, hands, segments, rotation, narrow, radius, angle);

    var color = '#00ff00';
    if (segment > 0) {
      if (hand % 2 === 0) {
        color = (segment % 2 === 0) ? '#ffff00' : '#ff0000';
      } else {
        color = (segment % 2 === 0) ? '#ffffff' : '#5555ff';
      }
    }

    for (var i = 0; i < points.length; i++) {
      L.circle([points[i].x, points[i].y], 0.1, {
        color: color,
        fillOpacity: 1
      }).addTo(mapView);
    }

    return amount;
  };

  var totalPlanets = debugDrawSegment(0, 0);

  for (var i = 0; i < hands; i++) {
    for (var j = 1; j <= segments; j++) {
      totalPlanets += debugDrawSegment(i, j);
    }
  }

  console.log('Total planets generated: ', totalPlanets);
};

Game.Planets.debugCalcFlyTime = function() {
  for (var i = 0; i <= 100; i++) {

    var maxSpeed = calcMaxSpeed(i);
    var acceleration = calcAcceleration(i);

    var strDebug = '';
    strDebug += i + '        ';
    strDebug += maxSpeed.toFixed(2) + '        ';
    strDebug += acceleration.toFixed(2) + '        ';
    strDebug += calcTotalTimeByDistance(1, maxSpeed, acceleration) + ' - ';
    strDebug += calcTotalTimeByDistance(2, maxSpeed, acceleration) + ' - ';
    strDebug += calcTotalTimeByDistance(20, maxSpeed, acceleration) + ' - ';
    strDebug += calcTotalTimeByDistance(40, maxSpeed, acceleration) + ' - ';
    strDebug += calcTotalTimeByDistance(80, maxSpeed, acceleration);

    if (i % 10 === 0) {
      console.log('================================================');
    }
    console.log(strDebug);
  }
};

Game.Planets.debugDump = function() {
  var dumpItems = function(items) {
    var dump = '';
    for (var i = 0; i < items.length; i++) {
      dump += (i > 0 ? ',' : '') + JSON.stringify(items[i]);
    }
    console.log('[' + dump + '];');
  };

  console.log('--------------- PLANETS ----------------');
  dumpItems( Game.Planets.Collection.find().fetch() );

  console.log('------------ SPACE EVENTS --------------');
  dumpItems(Space.collection.find({ status: Space.filterActive }).fetch());
};

};