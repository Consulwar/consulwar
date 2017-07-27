initCosmosClient = function() {
'use strict';

initCosmosLib();
initCosmosPathView();

initCosmosContentClient();

Meteor.subscribe('planets');
var spaceEventsSubscription = Meteor.subscribe('spaceEvents');

var isLoading = new ReactiveVar(false);
var zoom = new ReactiveVar(null);
var bounds = new ReactiveVar(null);
var isFleetSended = new ReactiveVar(false);
var updated = new ReactiveVar(null);

var mapView = null;
var pathViews = {};
var observerSpaceEvents = null;
var cosmosObjectsView = null;
var cosmosPopupView = null;
var selectedArtefact = new ReactiveVar(null);
var isPopupLocked = false;

var activeSquad = new ReactiveVar(null);
var selectedUnits = new ReactiveVar(null);


Game.SpaceEvents.getAll().observe({
  added: function(event) {
    if (spaceEventsSubscription.ready()) {
      showNotificationFromSpaceEvent(event);
    }
  },

  removed: function(event) {
    event.status = Game.SpaceEvents.status.FINISHED;
    showNotificationFromSpaceEvent(event);
  }
});

var showNotificationFromSpaceEvent = function(event) {
  if (!event || !event.info) {
    return;
  }
  var options = {};
  var targetPlanet = Game.Planets.Collection.findOne(event.info.targetId);

  if (event.info.mission && targetPlanet && event.status === Game.SpaceEvents.status.STARTED) {
    options.path = Router.path('cosmos', {group: 'cosmos'}, {hash: event._id});

    if (event.info.mission.type == 'tradefleet') {
      Game.showDesktopNotification('Консул, смотрите, караван!', options);
    } else {
      if (!targetPlanet.mission) {
        Game.showDesktopNotification('Консул, вашу колонию атакуют!', options);
      }
    }
  }
  
  if (!event.info.mission && event.status === Game.SpaceEvents.status.FINISHED) {
    options.path = Router.path(
      'cosmos', 
      {group: 'cosmos'}, 
      {hash: (targetPlanet._id || event._id)}
    );

    Game.showDesktopNotification('Консул, ваш флот долетел!', options);
  }
};

Game.Cosmos.showPage = function() {
  // clear content
  this.render('empty', { to: 'content' });
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

var isHistoryLoading = new ReactiveVar(false);
var historyBattles = new ReactiveArray();
var historyBattle = new ReactiveVar(null);
var historyPage = null;
var historyCountPerPage = 20;

Game.Cosmos.showHistory = function() {
  Router.current().render('cosmosHistory', { to: 'content' });
};

var loadHistoryBattle = function(itemId) {
  // try to get record from cache
  var isFound = false;
  for (var i = 0; i < historyBattles.length; i++) {
    if (historyBattles[i]._id == itemId) {
      isFound = true;
      historyBattle.set( historyBattles[i] );
      break;
    }
  }

  // not found, then load from server
  if (!isFound) {
    isHistoryLoading.set(true);
    Meteor.call('battleHistory.getById', itemId, function(err, data) {
      isHistoryLoading.set(false);
      if (err) {
        Notifications.error('Не удалось получить информацию о бое', err.error);
      } else {
        historyBattle.set( getBattleInfo(data) );
      }
    });
  }
};

Template.cosmosHistory.onRendered(function() {
  // run this function each time as page or hash cahnges
  this.autorun(function() {
    if (Router.current().route.getName() != 'cosmosHistory') {
      return;
    }
    
    var pageNumber = parseInt( Router.current().getParams().page, 10 );
    var itemId = Router.current().getParams().hash;

    isHistoryLoading.set(false);
    historyBattle.set(null);

    if (pageNumber != historyPage) {
      // new page, then need to load records
      historyPage = pageNumber;
      historyBattles.clear();
      isHistoryLoading.set(true);

      Meteor.call('battleHistory.getPage', pageNumber, historyCountPerPage, false, function(err, data) {
        isHistoryLoading.set(false);
        if (err) {
          Notifications.error('Не удалось получить историю боёв', err.error);
        } else {
          // parse data
          for (var i = 0; i < data.length; i++) {
            historyBattles.push( getBattleInfo( data[i] ) );
          }
          // load additional record
          if (itemId) {
            loadHistoryBattle(itemId);
          }
          setTimeout(function() {
            $('.content .history .scrollbar-inner').perfectScrollbar();
          });
        }
      });
    } else if (itemId) {
      // load additional record
      loadHistoryBattle(itemId);
    }
  });
});

Template.cosmosHistory.onDestroyed(function() {
  historyPage = null;
});

Template.cosmosHistory.helpers({
  isLoading: function() { return isHistoryLoading.get(); },
  countTotal: function() { return Game.Statistic.getUserValue('battle.total'); },
  countPerPage: function() { return historyCountPerPage; },
  battle: function() { return historyBattle.get(); },
  battles: function() { return historyBattles.list(); }
});

Template.cosmosHistory.events({
  'click tr:not(.header)': function(e, t) {
    $(e.currentTarget).toggleClass('expanded');
  }
});

var getArmyInfo = function(units, rest) {
  var result = [];

  for (var side in units) {
    for (var group in units[side]) {
      for (var name in units[side][group]) {

        var countStart = units[side][group][name];
        if (_.isString( countStart )) {
          countStart = game.Battle.count[ countStart ];
        }

        if (countStart <= 0) {
          continue;
        }

        var countAfter = 0;
        if (rest
         && rest[side]
         && rest[side][group]
         && rest[side][group][name]
        ) {
          countAfter = rest[side][group][name];
        }

        result.push({
          name: Game.Unit.items[side][group][name].name,
          order: Game.Unit.items[side][group][name].order,
          start: countStart,
          end: countAfter,
          resourcesLost: (countStart - countAfter > 0
            ? Game.Unit.items[side][group][name].price(countStart - countAfter)
            : null
          )
        });
      }
    }
  }

  result = _.sortBy(result, function(item) { return item.order; });

  return result.length > 0 ? result : null;
};

var getBattleInfo = function(item) {
  item.planet = null;
  if (_.isString(item.location)) {
    var planet = Game.Planets.getOne(item.location);
    if (planet) {
      item.planet = planet;
    }
  }

  for (let res in item.lostResources) {
    item.lostResources[res] *= -1;
  }

  item.reward = (!_.isEmpty(item.reward) ? item.reward : item.lostResources);

  for (let art in item.artefacts) {
    item.reward[art] = item.artefacts[art];
  }

  item.artefacts = _.map(item.artefacts, function(value, key) {
    return {
      engName: key,
      name: Game.Artefacts.items[key].name,
      amount: value
    };
  });

  item.cards = _.map(item.cards, function(value, key) {
    return {
      engName: key,
      name: Game.Cards.items.general[key].name,
      amount: value
    };
  });

  item.userUnits = getArmyInfo( item.userArmy, item.userArmyRest );
  item.enemyUnits =  getArmyInfo( item.enemyArmy, item.enemyArmyRest );

  if (item.userUnits) {
    item.lostUnitsPrice = {
      humans: 0,
      metals: 0,
      crystals: 0
    };

    item.lostUnitsCount = 0;

    for (let unit in item.userUnits) {
      let lostCount = item.userUnits[unit].start - item.userUnits[unit].end;
      item.lostUnitsCount += lostCount;

      if (lostCount) {
        if (item.userUnits[unit].resourcesLost.metals) {
          item.lostUnitsPrice.metals += item.userUnits[unit].resourcesLost.metals;
        }
        if (item.userUnits[unit].resourcesLost.crystals) {
          item.lostUnitsPrice.crystals += item.userUnits[unit].resourcesLost.crystals;
        }
        if (item.userUnits[unit].resourcesLost.humans) {
          item.lostUnitsPrice.humans += item.userUnits[unit].resourcesLost.humans;
        }
      }
    }

    item.lostUnitsPrice = {
      [item.lostUnitsPrice.humans   ? 'humans'   : 'empty'] : item.lostUnitsPrice.humans   || ' ',
      [item.lostUnitsPrice.metals   ? 'metals'   : 'empty'] : item.lostUnitsPrice.metals   || ' ',
      [item.lostUnitsPrice.crystals ? 'crystals' : 'empty'] : item.lostUnitsPrice.crystals || ' ',
    };
  }

  return item;
};

// ----------------------------------------------------------------------------
// Fleets side menu
// ----------------------------------------------------------------------------

var scrollMapToPlanet = function(id) {
  var planet = Game.Planets.getOne(id);
  if (planet) {
    mapView.setView([planet.x, planet.y], 7);
  }
};

var scrollMapToFleet = function(id) {
  var path = pathViews[id];
  var spaceEvent = Game.SpaceEvents.getOne(id);

  if (path && spaceEvent) {
    var totalFlyDistance = Game.Planets.calcDistance(
      spaceEvent.info.startPosition,
      spaceEvent.info.targetPosition
    );

    var currentDistance = Game.Planets.calcDistanceByTime(
      Session.get('serverTime') - spaceEvent.timeStart,
      totalFlyDistance,
      Game.Planets.calcMaxSpeed( spaceEvent.info.engineLevel ),
      Game.Planets.calcAcceleration( spaceEvent.info.engineLevel )
    );

    var k = currentDistance / totalFlyDistance;
    var position = path.getPointAlongDistanceByCoef(k);

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
  'mouseover .way .fleet_marker, mouseover .end .map-fleet-rept': function (e, t) {
    $(e.currentTarget).attr('data-tooltip', Blaze.toHTMLWithData(
      Template.cosmosShipInfo, 
      {
        ship: Game.Cosmos.getShipInfo(this.spaceEvent),
        spaceEvent: this.spaceEvent
      }
    ));
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
      tooltip = Blaze.toHTMLWithData(
        Template.cosmosPlanetPopup, 
        {
          drop: Game.Cosmos.getPlanetPopupInfo(this.planet),
          planet: this.planet
        }
      )
    }

    $(e.currentTarget).attr('data-tooltip', tooltip);
  }
});

Template.cosmos_planet_item.helpers({
  owner: function() {
    return (this.planet.mission 
      ? 'reptiles' 
      : this.planet.armyId || this.planet.isHome 
        ? 'humans' 
        : null
    );
  },

  getTimeNextDrop: function(timeCollected) {
    var passed = ( Session.get('serverTime') - timeCollected ) % Game.Cosmos.COLLECT_ARTEFACTS_PERIOD;
    return Game.Cosmos.COLLECT_ARTEFACTS_PERIOD - passed;
  }
});

Template.cosmos_planet_item.events({
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
      tooltip = Blaze.toHTMLWithData(
        Template.cosmosPlanetPopup, 
        {
          drop: Game.Cosmos.getPlanetPopupInfo(this.planet),
          planet: this.planet
        }
      )
    }

    $(e.currentTarget).attr('data-tooltip', tooltip);
  }
});

Template.cosmosFleetsInfo.helpers({
  userFleets: function () {
    var result = [];

    var i = 0;
    var data = null;

    var fleets = Game.SpaceEvents.getFleets().fetch();
    for (i = 0; i < fleets.length; i++) {
      if (!fleets[i].info.isHumans) {
        continue;
      }
      data = {
        id: fleets[i]._id,
        spaceEvent: fleets[i],
        start: Game.Planets.getOne( fleets[i].info.startPlanetId ),
        finish: Game.Planets.getOne( fleets[i].info.targetId ),
        timeStart: fleets[i].timeStart,
        timeEnd: fleets[i].timeEnd,
        isBack: fleets[i].info.isBack
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

        if (fleets[i].info.isOneway) {
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
      } else {
        data.name = 'Перехват';
        var target = Game.SpaceEvents.getOne(fleets[i].info.targetId);
        data.name += (
          ' ' + Game.Battle.items[target.info.mission.type].name 
          + ' ' + target.info.mission.level
        );
      }

      result.push(data);
    }
    
    var reinforcements = Game.SpaceEvents.getReinforcements().fetch();
    for (i = 0; i < reinforcements.length; i++) {
      data = {
        isReinforcement: true,
        id: reinforcements[i]._id,
        start: Game.Planets.getBase(),
        timeEnd: reinforcements[i].timeEnd,
      };
      data.start.owner = 'humans';
      data.name = 'Подкрепление';
      result.push(data);
    }

    return (result.length > 0) ? result : null;
  },

  reptileFleets: function () {
    var result = [];
    var fleets = Game.SpaceEvents.getFleets().fetch();
    for (var i = 0; i < fleets.length; i++) {
      if (fleets[i].info.isHumans) {
        continue;
      }
      var data = {
        id: fleets[i]._id,
        spaceEvent: fleets[i],
        start: Game.Planets.getOne( fleets[i].info.startPlanetId ),
        finish: Game.Planets.getOne( fleets[i].info.targetId ),
        timeStart: fleets[i].timeStart,
        timeEnd: fleets[i].timeEnd,
        isBack: fleets[i].info.isBack
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

      data.name = Game.Battle.items[fleets[i].info.mission.type].name + ' ' + fleets[i].info.mission.level;

      result.push(data);
    }
    return (result.length > 0) ? result : null;
  }
});

// ----------------------------------------------------------------------------
// Planet side menu
// ----------------------------------------------------------------------------

Game.Cosmos.showPlanetInfo = function(id) {
  Game.Cosmos.showPlanetPopup(id, true);
};

Game.Cosmos.getPlanetInfo = function(planet) {
  if (!planet) {
    return null;
  }

  var info = {};

  info.id = planet._id;
  info.name = planet.name;
  info.type = Game.Planets.types[planet.type].name;

  if (planet.isHome || planet.armyId) {
    info.isHumans = true;
    info.isHome = true;
    info.status = (planet.isHome) ? 'Планета Консула' : 'Колония';
    if (Game.Planets.getColonies().length <= 1) {
      info.canSend = false;
    } else {
      info.canSend = true;
    }

    if (planet.artefacts) {
      info.timeArtefacts = planet.timeArtefacts;
    }

  } else {
    info.isHumans = false;
    info.canSend = true;
  }

  if (planet.mission) {
    info.mission = {
      level: planet.mission.level,
      name: Game.Battle.items[planet.mission.type].name,
      reward: Game.Battle.items[planet.mission.type].level[planet.mission.level].reward
    };
  }

  if (planet.isHome || planet.armyId || planet.mission) {
    var units = Game.Planets.getFleetUnits(planet._id) ;
    if (units) {
      var side = (planet.mission) ? 'reptiles' : 'army';
      info.units = [];

      for (let engName in Game.Unit.items[side].fleet) {
        let unit = Game.Unit.items[side].fleet[engName];

        info.units.push({
          engName: engName,
          unit: unit,
          count: _.isString( units[engName] )
            ? game.Battle.count[ units[engName] ]
            : units[engName] || 0,
          countId: units[engName]
        });
      }
    }
  }

  return info;
};


var reptilesFleetPower = function(units) {
  return Game.Unit.calculateUnitsPower(_.reduce(units, function(units, unit) {
    let count = (_.isString( unit.count )
      ? game.Battle.countNumber[unit.countId].max
      : unit.count
    );

    if (count > 0) {
      units.reptiles.fleet[unit.engName] = count;
    }
    
    return units;
  }, {reptiles: {fleet: {}}}));
};

Template.cosmosPlanetPopup.helpers({
  getTimeNextDrop: function(timeCollected) {
    var passed = ( Session.get('serverTime') - timeCollected ) % Game.Cosmos.COLLECT_ARTEFACTS_PERIOD;
    return Game.Cosmos.COLLECT_ARTEFACTS_PERIOD - passed;
  },
  reptilesFleetPower: function() {
    return reptilesFleetPower(Game.Cosmos.getPlanetInfo(this.planet).units);
  }
});

Template.cosmosPlanetPopup.events({
  'click .open': function(e, t) {
    if (!Game.User.haveVerifiedEmail()) {
      return Notifications.info('Сперва нужно верифицировать email');
    }

    if (!Game.SpaceEvents.checkCanSendFleet()) {
      return Notifications.info('Слишком много флотов уже отправлено');
    }

    var id = $(e.currentTarget).attr("data-id");
    if (id) {
      Game.Cosmos.showAttackMenu(id);
    }
  },

  'click .edit': function(e, t) {
    var id = e.currentTarget.dataset.id;
    var targetPlanet = Game.Planets.getOne(id);
    var basePlanet = Game.Planets.getBase();

    Game.showInputWindow('Как назвать планету?', targetPlanet.name, function(planetName) {
      if (!planetName) {
        return;
      }

      planetName = planetName.trim();
      if (planetName == targetPlanet.name) {
        return;
      }

      if (id == basePlanet._id) {
        Meteor.call('user.changePlanetName', planetName, function(err, result) {
          if (err) {
            Notifications.error('Невозможно сменить название планеты', err.error);
          }
        });
      } else {
        Game.showAcceptWindow('Изменение имени планеты стоит ' +  Game.Planets.RENAME_PLANET_PRICE + ' ГГК', function() {
          var userResources = Game.Resources.getValue();
          if (userResources.credits.amount < Game.Planets.RENAME_PLANET_PRICE) {
            Notifications.error('Недостаточно ГГК');
            return;
          }

          Meteor.call('planet.changeName', id, planetName, function(err, result) {
            if (err) {
              Notifications.error('Невозможно сменить название планеты', err.error);
            }
          });
        });
      }
    });
  }
});

// ----------------------------------------------------------------------------
// Planets popup
// ----------------------------------------------------------------------------

Game.Cosmos.getPlanetPopupInfo = function(planet) {
  if (!planet) {
    return null;
  }

  var items = [];
  for (var key in planet.artefacts) {
    items.push({
      id: key,
      name: Game.Artefacts.items[key].name,
      chance: planet.artefacts[key],
      url: Game.Artefacts.items[key].url()
    });
  }

  var cards = null;
  if (planet.mission
   && Game.Battle.items[ planet.mission.type ]
   && Game.Battle.items[ planet.mission.type ].level[ planet.mission.level ].cards
  ) {
    var missionCards = Game.Battle.items[ planet.mission.type ].level[ planet.mission.level ].cards;
    cards = _.map(missionCards, function(value, key) {
      return {
        engName: key,
        chance: value,
        name: Game.Cards.items.general[key].name
      };
    });
  }

  return {
    name: planet.name,
    type: Game.Planets.types[planet.type].name,
    items: items,
    cards: cards
  };
};

Game.Cosmos.showPlanetPopup = function(id, isLock) {
  if (!mapView) {
    return;
  }

  var planet = Game.Planets.getOne(id);
  var dropInfo = Game.Cosmos.getPlanetPopupInfo(planet);
  if (!dropInfo) {
    return;
  }

  Game.Cosmos.hidePlanetPopup();

  if (isLock) {
    isPopupLocked = true;
  }

  cosmosPopupView = Blaze.renderWithData(
    Template.cosmosPlanetPopup, {
      planet: planet,
      drop: dropInfo,
      allowActions: isLock,
      position: function() {
        var k = Math.pow(2, (zoom.get() - 7));
        var iconSize = (planet.size + 3) * 4;
        var position = mapView.latLngToLayerPoint(new L.latLng(planet.x, planet.y));
        position.x += 24 + 10 + Math.round(iconSize * k / 2);
        position.y -= 85;
        return position;
      }
    },
    $('.leaflet-popup-pane')[0]
  );
};

Game.Cosmos.hidePlanetPopup = function() {
  if (cosmosPopupView) {
    Blaze.remove( cosmosPopupView );
    cosmosPopupView = null;
  }
  isPopupLocked = false;
};

// ----------------------------------------------------------------------------
// Ship side menu
// ----------------------------------------------------------------------------

Game.Cosmos.showShipInfo = function(id, isLock) {
  Game.Cosmos.hidePlanetPopup();

  if (isLock) {
    isPopupLocked = true;
  }

  var spaceEvent = Game.SpaceEvents.getOne(id);

  cosmosPopupView = Blaze.renderWithData(
    Template.cosmosShipInfo, {
      spaceEvent: spaceEvent,
      ship: Game.Cosmos.getShipInfo(spaceEvent),
      allowActions: isLock,
      position: function() {
        var pos = getFleetAnimation({
          spaceEvent: this.spaceEvent,
          maxSpeed: Game.Planets.calcMaxSpeed( this.spaceEvent.info.engineLevel ),
          acceleration: Game.Planets.calcAcceleration( this.spaceEvent.info.engineLevel ),
          totalFlyDistance: Game.Planets.calcDistance(
            this.spaceEvent.info.startPosition,
            this.spaceEvent.info.targetPosition
          )
        });
        return {
          x: pos.x + 50,
          y: pos.y - 50
        };
      }
    },
    $('.leaflet-popup-pane')[0]
  );
};

Game.Cosmos.getShipInfo = function(spaceEvent) {
  if (!spaceEvent || spaceEvent.status == Game.SpaceEvents.status.FINISHED) {
    return null;
  }

  var info = {};

  info.name = null;
  info.id = spaceEvent._id;

  if (spaceEvent.info.isHumans) {
    info.isHumans = true;
    info.canSend = false;
    info.status = 'Флот Консула';
  } else {
    info.isHumans = false;
    info.canSend = true;
    info.mission = {
      level: spaceEvent.info.mission.level,
      name: Game.Battle.items[spaceEvent.info.mission.type].name,
      reward: Game.Battle.items[spaceEvent.info.mission.type].level[spaceEvent.info.mission.level].reward
    };
    info.status = 'Флот Рептилий';
  }

  var units = Game.SpaceEvents.getFleetUnits(spaceEvent);
  if (units) {
    var side = (spaceEvent.info.isHumans) ? 'army' : 'reptiles';
    info.units = [];

    for (let engName in Game.Unit.items[side].fleet) {
      let unit = Game.Unit.items[side].fleet[engName];

      info.units.push({
        engName: engName,
        unit,
        count: _.isString( units[engName] )
          ? game.Battle.count[ units[engName] ]
          : units[engName] || 0,
        countId: units[engName]
      });
    }
  }

  return info;
};

Game.Cosmos.getReinforcementInfo = function(spaceEvent) {
  if (!spaceEvent || spaceEvent.status == Game.SpaceEvents.status.FINISHED) {
    return null;
  }

  var info = {};

  info.name = null;
  info.id = spaceEvent._id;
  info.isHumans = true;
  info.canSend = false;
  info.status = 'Подкрепление';

  var units = spaceEvent.info.units.army.ground;
  if (units) {
    info.units = [];
    for (var key in units) {
      info.units.push({
        engName: key,
        name: Game.Unit.items.army.ground[key].name,
        count: units[key]
      });
    }
  }

  return info;
};


Template.cosmosShipInfo.onRendered(function() {
  // show fleets info when ship removed
  this.autorun(function() {
    if (!mapView) {
      return;
    }

    if (!Template.currentData().spaceEvent) {
      Game.Cosmos.hidePlanetPopup();
    }
  });
});

Template.cosmosShipInfo.helpers({
  timeLeft: function() {
    return (!this.spaceEvent) ? 0 : this.spaceEvent.timeEnd - Session.get('serverTime');
  },
  reptilesFleetPower: function() {
    return reptilesFleetPower(this.ship.units);
  }
});

Template.cosmosShipInfo.events({
  'click .open': function(e, t) {
    if (!Game.SpaceEvents.checkCanSendFleet()) {
      Notifications.info('Слишком много флотов уже отправлено');
      return;
    }

    var id = $(e.currentTarget).attr("data-id");
    if (id) {
      Game.Cosmos.showAttackMenu(id);
    }
  }
});

// ----------------------------------------------------------------------------
// Attack menu
// ----------------------------------------------------------------------------
var activeColonyId = new ReactiveVar(null);

var resetColonyId = function() {
  if(!Game.Planets.getFleetUnits(activeColonyId.get())) {
    activeColonyId.set(Game.Planets.getBase()._id);
  }
};

Game.Cosmos.showAttackMenu = function(id) {
  resetColonyId();

  Router.current().render('cosmosAttackMenu', {
    to: 'cosmosAttackMenu',
    data: {
      id,
      activeColonyId,
      updated,
      activeSquad,
      selectedUnits
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
  for(let engName in Game.Unit.items.army.fleet) {
    if (squad && squad.units && squad.units[engName]) {
      units[engName] = squad.units[engName];
    } else {
      units[engName] = 0;
    }
  }
  selectedUnits.set(units);
};
resetSelectedUnits();

var selectAllAvaliableUnits = function() {
  var army = Game.Planets.getFleetUnits(activeColonyId.get());
  var units = {};
  for(let engName in Game.Unit.items.army.fleet) {
    units[engName] = (army && army[engName]) || 0;
  }
  selectedUnits.set(units);
};

var timeAttack = function(id) {
  var baseId = id || Template.instance().data.activeColonyId.get();
  var basePlanet = Game.Planets.getOne(baseId);
  if (!basePlanet) {
    return null;
  }

  var targetId = Template.instance().data.id;
  var engineLevel = Game.Planets.getEngineLevel();

  var targetPlanet = Game.Planets.getOne(targetId);
  if (targetPlanet) {
    return Game.Planets.calcFlyTime(basePlanet, targetPlanet, engineLevel);
  }

  var targetShip = Game.SpaceEvents.getOne(targetId);
  if (targetShip) {
    var result = Game.Planets.calcAttackOptions(
      basePlanet,
      engineLevel,
      targetShip,
      Session.get('serverTime')
    );
    return (result) ? result.time : null;
  }

  return null;
};

Template.cosmosAttackMenu.helpers({
  isFleetSended: function() {
    return isFleetSended.get();
  },

  ship: function() {
    return Game.SpaceEvents.getOne(this.id);
  },

  planet: function() {
    return Game.Planets.getOne(this.id);
  },

  timeAttack: timeAttack,

  timeLeft: function() {
    var targetId = this.id;
    var targetShip = Game.SpaceEvents.getOne(targetId);
    if (targetShip) {
      return targetShip.timeEnd - Session.get('serverTime');
    }

    return null;
  },

  activeColonyId: function() {
    return Template.instance().data.activeColonyId.get();
  },

  activeSquad: function() {
    return Template.instance().data.activeSquad.get();
  },

  availableFleet: function() {
    var colonyId = this.activeColonyId.get();

    var army = Game.Planets.getFleetUnits(colonyId) || {};

    var selected = selectedUnits.get();

    var units = [];

    for (var key in Game.Unit.items.army.fleet) {
      var max = 0;
      if (army[key] && army[key] > 0) {
        max = army[key];
      }
      
      units.push({
        engName: key,
        name: Game.Unit.items.army.fleet[key].name,
        max: max,
        count: (selected && selected[key]) || 0
      });
    }

    return units;
  },

  selectedFleetPower: function() {
    var units = selectedUnits.get();

    return Game.Unit.calculateUnitsPower(_.reduce(_.keys(units), function(resultUnits, unitName) {
      let count = units[unitName];
      if (count > 0) {
        resultUnits.army.fleet[unitName] = count;
      }
      
      return resultUnits;
    }, {army: {fleet: {}}}));
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

  extraColonyPrice: function() {
    return Game.Planets.getExtraColonyPrice();
  },

  canHaveMoreExtraColonies: function() {
    return Game.Planets.getExtraColoniesCount() < Game.Planets.MAX_EXTRA_COLONIES;
  },

  isAllSelected,

  colonies: function() {
    var maxCount = Game.Planets.getMaxColoniesCount();
    var result = Game.Planets.getColonies();
    var ids = [];

    var n = result.length;
    while (n-- > 0) {
      ids.push(result[n]._id);
    }
    

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

    for (let i = 0 ; i < result.length; i++) {
      result[i].timeAttack = timeAttack(result[i]._id);
    }

    _.chain(result)
      .sortBy(function(item) { 
        return (item.timeAttack 
          ? item.timeAttack
          : Infinity
        ); 
      })
      .first(3)
      .each(function(item) {
        if (item.timeAttack) {
          item.isTopTime = true;
        }
      });

    if (result.length > 1) {
      for (let i = 0; i < result.length; i++) {
        // Change selected colony if it is selected
        if (result[i]._id == this.id && this.id == this.activeColonyId.get()) {
          this.activeColonyId.set( result[i > 0 ? i - 1 : i + 1]._id );
          break;
        }
      }
    }

    // count sent
    var sentCount = 0;

    var fleets = Game.SpaceEvents.getFleets().fetch();
    for (let i = 0; i < fleets.length; i++) {
      var fleet = fleets[i];

      if (!fleet.info.isHumans) {
        continue;
      }

      var targetId = fleet.info.isOneway
        ? fleet.info.targetId
        : fleet.info.startPlanetId;

      if (ids.indexOf(targetId) == -1) {
        sentCount++;
      }
    }

    for (let i = result.length; i < maxCount; i++) {
      result.push({
        isEmpty: true,
        isSent: (sentCount > 0 ? true : false),
        size: Game.Random.interval(2, 5),
        type: _.sample(_.toArray(Game.Planets.types)).engName
      });
      sentCount--;
    }

    let possibleBuyPlanets = Game.Planets.MAX_EXTRA_COLONIES - Game.Planets.getExtraColoniesCount();
    let buyPlanetNumber = 0;
    let purchasedPlanets = Game.Planets.getExtraColoniesCount();
    let requiredRank = Game.User.getLevel();

    for (let i = result.length; i < 20; i++) {
      result.push({
        notAvaliable: true,
        canBuy: buyPlanetNumber < possibleBuyPlanets,
        requiredRank: buyPlanetNumber >= possibleBuyPlanets 
          ? ++requiredRank 
          : null,
        price: buyPlanetNumber < possibleBuyPlanets 
          ? Game.Planets.getExtraColonyPrice(
            purchasedPlanets + buyPlanetNumber
          )
          : null,
        size: Game.Random.interval(2, 5),
        type: _.sample(_.toArray(Game.Planets.types)).engName
      });
      buyPlanetNumber++;
    }

    return result;
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
  }
});

Template.cosmosAttackMenu.events({
  'click .btn-close': function(e, t) {
    Game.Cosmos.hideAttackMenu();
  },

  'click .resources .credits': function(e, t) {
    Game.Payment.showWindow();
  },
  
  'click a.planet.canBuy': function(e, t) {
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
    if (id && $(e.currentTarget).hasClass('humans') && !$(e.currentTarget).hasClass('disabled')) {
      resetSelectedUnits();

      // set new colony id
      t.data.activeColonyId.set( id );
    }
  },

  'click .btn-all': function(e, t) {
    if (isAllSelected()) {
      resetSelectedUnits();
    } else {
      selectAllAvaliableUnits();
    }
  },

  'click .fleet a, click .fleet .max': function(e, t) {
    var id = $(e.currentTarget.parentElement).attr('data-id');
    var max = $(e.currentTarget.parentElement).attr('data-max');
    var input = $(e.currentTarget.parentElement).find('input');

    var selected = selectedUnits.get();

    if (max == input.val()) {
      selected[id] = 0;
    } else {
      selected[id] = max;
    }

    selectedUnits.set(selected);
  },

  'change .fleet input': function (e, t) {
    var value = parseInt( e.currentTarget.value, 10 );
    var id = $(e.currentTarget.parentElement.parentElement).attr('data-id');
    var max = parseInt( $(e.currentTarget.parentElement.parentElement).attr('data-max'), 10 );

    var selected = selectedUnits.get();

    if (value < 0) {
      selected[id] = 0;
    } else if (value > max) {
      selected[id] = max;
    } else {
      selected[id] = value;
    }

    selectedUnits.set(selected);
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
    var ship = Game.SpaceEvents.getOne(targetId);

    if (!planet && !ship) {
      Notifications.info('Не выбрана цель');
      return;
    }

    if (planet) {
      // Send to planet
      isFleetSended.set(true);
      Meteor.call(
        'planet.sendFleet',
        basePlanet._id,
        targetId, 
        units,
        isOneway,
        function(err) {
          isFleetSended.set(false);

          if (err) {
            Notifications.error('Не удалось отправить флот', err.error);
          } else {
            Notifications.success('Флот отправлен');
            Game.Cosmos.hideAttackMenu();
            resetColonyId();
          }
        }
      );

    } else if (ship) {
      // Attack ship
      var pathView = pathViews[ship._id];
      var engineLevel = Game.Planets.getEngineLevel();

      var attack = Game.Planets.calcAttackOptions(
        basePlanet,
        engineLevel,
        ship,
        Session.get('serverTime')
      );

      if (!attack || !pathView) {
        Notifications.info('Невозможно перехватить вражеский флот');
        return;
      }

      var attackPoint = pathView.getPointAlongDistanceByCoef(attack.k);
      isFleetSended.set(true);
      Meteor.call(
        'spaceEvents.attackReptFleet',
        basePlanet._id,
        targetId,
        units,
        attackPoint.x, 
        attackPoint.y,
        function(err) {
          isFleetSended.set(false);
          
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

    Game.Icons.showSelectWindow(function(group, name) {
      var squad = Game.Squad.getOne(slot) || {name: 'Отряд ' + slot};
      var message = 'Сменить иконку отряда «' + squad.name + '»';

      Game.showAcceptWindow(message, function() {
        Meteor.call('squad.setIcon', {slot, group, name}, function(err, result) {
          if (err) {
            Notifications.error('Не удалось выбрать иконку', err.error);
          } else {
            Notifications.success('Вы поменяли иконку');
          }
        });
      });
    }, function(group, id) {
      if (Game.Squad.getOne(slot).icon == group + '/' + id) {
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

Game.Cosmos.renderCosmosObjects = function() {
  // Add layer for markers
  $(mapView.getContainer()).append('<div class="leaflet-marker-pane"></div>');
 
  cosmosObjectsView = Blaze.renderWithData(
    Template.cosmosObjects, {
      planets: function() {
        var planets = Game.Planets.getAll().fetch();
        return _.map(planets, function(planet) {
          return {
            iconSize: (planet.size + 3) * 4,
            planet: planet
          };
        });
      },

      fleets: function() {
        var fleets = Game.SpaceEvents.getFleets().fetch();
        return _.map(fleets, function(spaceEvent) {
          return {
            spaceEvent: spaceEvent,
            maxSpeed: Game.Planets.calcMaxSpeed( spaceEvent.info.engineLevel ),
            acceleration: Game.Planets.calcAcceleration( spaceEvent.info.engineLevel ),
            totalFlyDistance: Game.Planets.calcDistance(
              spaceEvent.info.startPosition,
              spaceEvent.info.targetPosition
            )
          };
        });
      }
    },
    $('.leaflet-marker-pane')[0]
  );
};

var getFleetAnimation = function(fleet) {
  var currentZoom = zoom.get();
  var currentTime = Session.get('serverTime');
  
  var path = pathViews[ fleet.spaceEvent._id ];
  if (!path) {
    return {
      x: 0,
      y: 0,
      angle: 0
    };
  }

  var currentDistance = Game.Planets.calcDistanceByTime(
    currentTime - fleet.spaceEvent.timeStart,
    fleet.totalFlyDistance,
    fleet.maxSpeed,
    fleet.acceleration
  );

  var k = currentDistance / fleet.totalFlyDistance;
  var curPoint = path.getPointAlongDistanceByCoef(k);

  var nextPoint = fleet.spaceEvent.info.targetPosition;
  if (k < 0.99) {
    nextPoint = path.getPointAlongDistanceByCoef(k + 0.01);
  }
  var angleRad = Math.atan2(nextPoint.y - curPoint.y, nextPoint.x - curPoint.x);

  var angleDeg = Math.floor( angleRad * 180 / Math.PI );
  if (fleet.spaceEvent.info.isHumans) {
    angleDeg += 180;
  }

  var coords =  mapView.latLngToLayerPoint(new L.latLng(curPoint.x, curPoint.y));

  return {
    x: coords.x,
    y: coords.y,
    angle: angleDeg
  };
};

Template.cosmosObjects.events({
  'mouseover .map-fleet': function(e, t) {
    let eventId = e.currentTarget.dataset.id;

    let polyline = pathViews[eventId].polyline;
    polyline.setStyle({
      weight: 3
    });
    polyline.bringToFront();

    $(`.map-fleet:not([data-id="${eventId}"])`).addClass('blur');
    $('.map-planet-marker').addClass('blur');

    let planetsId = '[data-id="' + _.map(pathViews[eventId].planetsInPath, (planet)=> planet._id).
      join('"], [data-id="') + '"]';

    $(planetsId).removeClass('blur');

    for (let id in pathViews) {
      if (id !== eventId) {
        pathViews[id].polyline.setStyle({opacity: 0.4});
      }
    }
  },

  'mouseout .map-fleet': function(e, t) {
    let eventId = e.currentTarget.dataset.id;

    pathViews[eventId].polyline.setStyle({
      weight: 2
    });

    $(`.map-fleet`).removeClass('blur');

    $('.map-planet-marker').removeClass('blur');

    for (let id in pathViews) {
      if (id !== eventId) {
        pathViews[id].polyline.setStyle({opacity: 1});
      }
    }
  }
});

Template.cosmosObjects.helpers({
  zoom: function() {
    return zoom.get();
  },

  owner: function() {
    return (this.planet.mission 
      ? 'reptiles' 
      : this.planet.armyId || this.planet.isHome 
        ? 'humans' 
        : null
    );
  },

  getPlanetPosition: function(x, y, iconSize) {
    var k = Math.pow(2, (zoom.get() - 7));
    var coords = mapView.latLngToLayerPoint(new L.latLng(x, y));

    return {
      x: coords.x,
      y: coords.y,
      height: iconSize * k,
      width: iconSize * k,
      marginTop: iconSize * k * -0.5,
      marginLeft: iconSize * k * -0.5,
      nameTop: -30,
      nameLeft: -100 + iconSize * k * 0.5
    };
  },

  getFleetAnimation: getFleetAnimation,

  isHidden: function(x, y) {
    return false;

    if (bounds.get().contains(new L.latLng(x, y))) {
      return false;
    } else {
      return true;
    }
  },

  isHighlighted: function(planet) {
    return planet.artefacts && planet.artefacts.hasOwnProperty(selectedArtefact.get());
  },

  selectedArtefact: function() {
    return selectedArtefact.get();
  }
});

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

Template.cosmos.onRendered(function() {
  // Init map
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
    minZoom: 2, //3
    maxZoom: 10
  });

  zoom.set( mapView.getZoom() );
  mapView.on('zoomend', function(e) {
    zoom.set( mapView.getZoom() );
  }.bind(this));

  bounds.set( mapView.getBounds() );
  mapView.on('moveend', function(e) {
    bounds.set( mapView.getBounds() );
  }.bind(this));

  // Init planets
  var alignMapToBasePlanet = function() {
    var homePlanet = Game.Planets.getBase();
    if (homePlanet) {
      mapView.setView([homePlanet.x, homePlanet.y], 7);
    }
    isLoading.set(false);
  };

  var planets = Game.Planets.getAll().fetch();
  if (planets.length === 0) {
    Meteor.call('planet.initialize', function(err, data) {
      alignMapToBasePlanet();
    });
  } else {
    alignMapToBasePlanet();
  }

  // Paths
  var createPath = function(id, event) {
    if (!mapView || pathViews[id]) {
      return;
    }

    // draw path
    pathViews[id] = new game.PathView(
      mapView,
      event.info.startPosition,
      event.info.targetPosition,
      0,
      0,
      (event.info.isHumans ? '#c6e84c' : '#ff7566'),
      id,
      pathViews
    );
  };

  var removePath = function(id) {
    if (mapView && pathViews[id]) {
      pathViews[id].remove();
      delete pathViews[id];
    }
  };

  observerSpaceEvents = Game.SpaceEvents.getAll().observeChanges({
    added: function(id, event) {
      if (event.type == Game.SpaceEvents.type.SHIP) {
        createPath(id, event);
      }
    },

    removed: function(id) {
      removePath(id);
    }
  });

  // Render cosmos objects
  Game.Cosmos.renderCosmosObjects.call(this);

  // Show default side info
  //Game.Cosmos.showFleetsInfo();

  mapView.on('click', function(e) {
    Game.Cosmos.hidePlanetPopup();
  });

  // Scroll to space object on hash change
  this.autorun(function() {
    var hash = Router.current().getParams().hash;
    if (hash) {
      zoom.dep.changed();
      Tracker.nonreactive(function() {
        // highlight planets by artefact
        if (Game.Artefacts.items[hash]) {
          selectedArtefact.set(hash);
        }
        // select planet
        else if (Game.Planets.getOne(hash)) {
          Game.Cosmos.showPlanetInfo(hash);
          scrollMapToPlanet(hash);
        }
        // select ship
        else {
          Game.Cosmos.showShipInfo(hash, true);
          scrollMapToFleet(hash);
        }
      });
    }
  });
});

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
  isLoading: function() {
    return isLoading.get();
  },

  isSelection: function() {
    return selectedArtefact.get();
  }
});

Template.cosmos.events({
  'click .btn-selection': function(e, t) {
    selectedArtefact.set(null);
  },

  'click .map-fleet': function(e, t) {
    var id = $(e.currentTarget).attr('data-id');
    if (id) {
      Game.Cosmos.showShipInfo(id, true);
    }
  },

  'mouseover .map-fleet': function(e, t) {
    if (!isPopupLocked) {
      var id = $(e.currentTarget).attr('data-id');
      Game.Cosmos.showShipInfo.call(t, id);
    }
  },

  'click .map-planet-marker': function(e, t) {
    var id = $(e.currentTarget).attr('data-id');
    if (id) {
      Game.Cosmos.showPlanetInfo(id);
    }
  },

  'mouseover .map-planet-marker': function(e, t) {
    if (!isPopupLocked) {
      var id = $(e.currentTarget).attr('data-id');
      Game.Cosmos.showPlanetPopup.call(t, id);
    }
  },

  'mouseout .map-planet-marker, mouseout .map-fleet': function(e, t) {
    if (!isPopupLocked) {
      Game.Cosmos.hidePlanetPopup();
    }
  },

  'click .map-control-home': function(e, t) {
    if (mapView) {
      var homePlanet = Game.Planets.getBase();
      if (homePlanet) {
        mapView.setView([homePlanet.x, homePlanet.y], 7);
      } else {
        mapView.setView([0, 0], 7);
      }
    }
  }
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
    var amount = Game.Planets.calcSegmentPlanetsAmount(hand, segment, hands, segments, min, max);
    var points = Game.Planets.calcSegmentRandomPoints(amount, hand, segment, hands, segments, rotation, narrow, radius, angle);

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

    var maxSpeed = Game.Planets.calcMaxSpeed(i);
    var acceleration = Game.Planets.calcAcceleration(i);

    var strDebug = '';
    strDebug += i + '        ';
    strDebug += maxSpeed.toFixed(2) + '        ';
    strDebug += acceleration.toFixed(2) + '        ';
    strDebug += Game.Planets.calcTotalTimeByDistance(1, maxSpeed, acceleration) + ' - ';
    strDebug += Game.Planets.calcTotalTimeByDistance(2, maxSpeed, acceleration) + ' - ';
    strDebug += Game.Planets.calcTotalTimeByDistance(20, maxSpeed, acceleration) + ' - ';
    strDebug += Game.Planets.calcTotalTimeByDistance(40, maxSpeed, acceleration) + ' - ';
    strDebug += Game.Planets.calcTotalTimeByDistance(80, maxSpeed, acceleration);

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
  dumpItems( Game.SpaceEvents.Collection.find({status: 1}).fetch());
};

};