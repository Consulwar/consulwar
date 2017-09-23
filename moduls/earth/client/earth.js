import { Command, ResponseToGeneral } from '../lib/generals';

initEarthClient = function() {
'use strict';

initEarthLib();
initEarthAdminClient();

Meteor.subscribe('zones');
Meteor.subscribe('earthUnits');

Game.Earth.showMap = function() {
  this.render('earth', {
    to: 'content',
    data: {}
  });
};

// ----------------------------------------------------------------------------
// Earth battle history
// ----------------------------------------------------------------------------

var isHistoryLoading = new ReactiveVar(false);
var historyBattles = new ReactiveArray();
var historyBattle = new ReactiveVar(null);
var historyPage = null;
var historyCountPerPage = 20;

Game.Earth.showHistory = function() {
  Router.current().render('earthHistory', { to: 'content' });
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
        historyBattle.set(data);
      }
    });
  }
};

Template.earthHistory.onRendered(function() {
  // run this function each time as page or hash cahnges
  this.autorun(function() {
    if (Router.current().route.getName() != 'earthHistory') {
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

      Meteor.call('battleHistory.getPage', pageNumber, historyCountPerPage, true, function(err, data) {
        isHistoryLoading.set(false);
        if (err) {
          Notifications.error('Не удалось получить историю боев', err.error);
        } else {
          // parse data
          for (var i = 0; i < data.length; i++) {
            historyBattles.push(data[i]);
          }
          // load additional record
          if (itemId) {
            loadHistoryBattle(itemId);
          }
        }
      });
    } else if (itemId) {
      // load additional record
      loadHistoryBattle(itemId);
    }
  });
});

Template.earthHistory.onDestroyed(function() {
  historyPage = null;
});

Template.earthHistory.helpers({
  isLoading: function() { return isHistoryLoading.get(); },
  countTotal: function() { return Game.Statistic.getSystemValue('battle.total'); },
  countPerPage: function() { return historyCountPerPage; },
  battle: function() { return historyBattle.get(); },
  battles: function() { return historyBattles.list(); }
});

Template.earthHistoryItem.helpers({
  currentPage: function() {
    return Router.current().params.page;
  },

  getArmyInfo: function(units, rest) {
    var result = [];
    var wasBattle = (this.battle.result === undefined) ? false : true;

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
            end: wasBattle ? countAfter : countStart
          });
        }
      }
    }

    result = _.sortBy(result, function(item) { return item.order; });

    return result.length > 0 ? result : null;
  }
});

Template.earthHistory.events({
  'click tr:not(.header)': function(e, t) {
    var page = Router.current().params.page;
    var id = $(e.currentTarget).attr('data-id');
    if (id) {
      Router.go('earthHistory', { group: 'earth', page: page }, { hash: id });
    }
  }
});

// ----------------------------------------------------------------------------
// Reserve
// ----------------------------------------------------------------------------

Game.Earth.showReserve = function() {
  const name = this.params.name;

  Router.current().render('reserve', {
    to: 'content',
    data: {
      honor: new ReactiveVar(0),
      name
    }
  });
};

Template.reserve.helpers({
  units: function() {
    return _.map(Game.Unit.items.army.ground, function(val, key) {
      return {
        engName: key,
        max: val.currentLevel()
      };
    });
  },

  honor: function() {
    return this.honor.get();
  }
});

Template.reserve.events({
  'click .btn-all': function(e, t) {
    $('.units li').each(function(index, element) {
      var max = Number( $(element).attr('data-max') );
      $(element).find('.count').val( max );
      $(element).find('.count').change();
    });
  },

  'change .units input': function (e, t) {
    var value = parseInt( e.currentTarget.value );
    var max = parseInt( $(e.currentTarget.parentElement).attr('data-max') );

    if (value < 0) {
      e.currentTarget.value = 0;
    } else if (value > max) {
      e.currentTarget.value = max;
    }

    // recalculate honor
    var honor = 0;

    $('.units li').each(function(index, elem) {
      var element = $(elem);
      var id = element.attr('data-id');
      var max = parseInt( element.attr('data-max') );
      var count = parseInt( element.find('.count').val() );

      if (max < count) {
        count = max;
      }

      if (count > 0) {
        honor += Game.Resources.calculateHonorFromReinforcement(
          Game.Unit.items.army.ground[id].price(count)
        );
      }
    });

    t.data.honor.set(honor);
  },

  'click .btn-send': function(e, t) {
    if (!Game.SpaceEvents.checkCanSendFleet()) {
      return Notifications.info('Слишком много флотов уже отправлено');
    }

    var total = 0;
    var units = {};

    $('.units li').each(function(index, elem) {
      var element = $(elem);
      var id = element.attr('data-id');
      var max = parseInt( element.attr('data-max') );
      var count = parseInt( element.find('.count').val() );

      if (max > 0 && count > 0) {
        units[ id ] = Math.min(max, count);
        total += units[ id ];
      }

      element.find('.count').val(0);
      element.find('.count').change();
    });

    if (total <= 0) {
      return Notifications.info('Выберите войска для отправки');
    }

    Meteor.call('earth.sendReinforcement', units, null, t.data.name, function(err) {
      if (err) {
        Notifications.error('Не удалось отправить войска', err.error);
      } else {
        Notifications.success('Войска отправлены на Землю');
      }
    });
  }
});

// ----------------------------------------------------------------------------
// Zone info
// ----------------------------------------------------------------------------

Game.Earth.showZone = function() {
  var name = this.params.name;

  Router.current().render('earthZoneInfo', {
    to: 'content',
    data: {
      name: name
    }
  });
};

Template.earthZoneInfo.helpers({
  zone: function() {
    return Game.EarthZones.getByName(this.name);
  },

  army: function() {
    return Game.EarthUnits.get();
  },

  info: function() {
    var zone = Game.EarthZones.getByName(this.name);
    let userUnits = Game.EarthUnits.get();
    let userUnitsArmy = {};
    if (userUnits && userUnits.zoneName === this.name) {
      userUnitsArmy = userUnits.userArmy;
    }

    var maxHealth = Game.EarthZones.calcMaxHealth();
    var currentUserPower = Game.Unit.calcUnitsHealth( zone.userArmy );
    var currentEnemyPower = Game.Unit.calcUnitsHealth( zone.enemyArmy );

    var side = null;
    var group = null;
    var name = null;

    var userArmy = (zone.userArmy) ? [] : null;
    for (side in zone.userArmy) {
      for (group in zone.userArmy[side]) {
        for (name in zone.userArmy[side][group]) {
          userArmy.push({
            name: Game.Unit.items[side][group][name].name,
            count: zone.userArmy[side][group][name],
            userUnitsCount: (userUnitsArmy[side] && userUnitsArmy[side][group]) ?
              userUnitsArmy[side][group][name] : null,
          });
        }
      }
    }

    var enemyArmy = (zone.enemyArmy) ? [] : null;
    for (side in zone.enemyArmy) {
      for (group in zone.enemyArmy[side]) {
        for (name in zone.enemyArmy[side][group]) {
          enemyArmy.push({
            name: Game.Unit.items[side][group][name].name,
            count: zone.enemyArmy[side][group][name]
          });
        }
      }
    }

    var userCount = 0;
    var enemyCount = 0;

    var zones = Game.EarthZones.getAll().fetch();
    for (var i = 0; i < zones.length; i++) {
      if (zones[i].isEnemy) {
        enemyCount++;
      } else {
        userCount++;
      }
    }

    var totalCount = userCount + enemyCount;
    var capturedPercent = Math.round( (userCount / totalCount) * 100 );

    var userPower = (maxHealth > 0)
      ? Math.round( (currentUserPower / maxHealth) * 100 )
      : 0;

    var enemyPower = (maxHealth > 0)
      ? Math.round( (currentEnemyPower / maxHealth) * 100 )
      : 0;

    return {
      name: zone.name,
      capturedPercent: capturedPercent,
      userCount: userCount,
      userPower: userPower,
      userArmy: userArmy,
      enemyCount: enemyCount,
      enemyPower: enemyPower,
      enemyArmy: enemyArmy
    };
  }
});

// ----------------------------------------------------------------------------
// Zone popup
// ----------------------------------------------------------------------------

var zonePopupView = null;

Game.Earth.showZonePopup = function(name, latlng) {
  if (!mapView || !zoneViews[name]) {
    return;
  }

  Game.Earth.hideZonePopup();

  var zoom = new ReactiveVar( mapView.getZoom() );
  mapView.on('zoomend', function(e) {
    zoom.set( mapView.getZoom() );
  });

  zonePopupView = Blaze.renderWithData(
    Template.earthZonePopup, {
      name: name,
      position: function() {
        zoom.get();
        return mapView.latLngToLayerPoint(latlng);
      }
    },
    $('.leaflet-popup-pane')[0]
  );
};

Game.Earth.hideZonePopup = function() {
  if (zonePopupView) {
    Blaze.remove( zonePopupView );
    zonePopupView = null;
  }
};

Template.earthZonePopup.helpers({
  zone: function() {
    return Game.EarthZones.getByName(this.name);
  },

  zoneBonusLine() {
    const zone = Game.EarthZones.getByName(this.name);

    const { id, count } = zone.bonus;

    const bonusObj = {};
    const keys = id.split('.');
    const lastKey = keys.pop();
    let curObj = bonusObj;
    keys.forEach((key) => {
      curObj[key] = {};
      curObj = curObj[key];
    });
    curObj[lastKey] = count;

    const item = Game.getObjectByPath(bonusObj);

    return `${item.name}, ${count}`;
  },

  armyZone() {
    const earthUnit = Game.EarthUnits.get();
    if (earthUnit) {
      return Game.EarthZones.getByName(earthUnit.zoneName);
    }
    return null;
  },

  hasLink: function () {
    let army = Game.EarthUnits.get();
    if (army) {
      let armyZone = Game.EarthZones.getByName(army.zoneName);

      if (this.name === army.zoneName || armyZone.links.indexOf(this.name) !== -1) {
        return true;
      }
    }

    return false;
  },

  notBattle: function () {
    let army = Game.EarthUnits.get();
    if (army) {
      let armyZone = Game.EarthZones.getByName(army.zoneName);

      if (armyZone && armyZone.battleID) {
        return false;
      }
    }

    return true;
  },

  army: function() {
    return Game.EarthUnits.get();
  },

  ResponseToGeneral() {
    return ResponseToGeneral;
  },

  Command() {
    return Command;
  },
});

Template.earthZonePopup.events({
  'click .btn-command': function(e, t) {
    var action = $(e.currentTarget).attr('data-action');
    Meteor.call('earth.moveArmy', action);
  },

  'click .btn-general-command'(event) {
    const target = $(event.currentTarget).attr('data-action');
    Meteor.call('earth.generalCommand', 'move', target);
  },

  'click .btn-response-yes'() {
    Meteor.call('earth.responseToGeneral', true);
  },

  'click .btn-response-no'() {
    Meteor.call('earth.responseToGeneral', false);
  },

  'click .btn-admin-panel': function (event, templateInstance) {
    const zoneName = templateInstance.$(event.currentTarget).attr('data-action');

    Game.Popup.show('adminReptileChange', {
      zoneName,
    });
  },
});

// ----------------------------------------------------------------------------
// Zone view (maker + polygon on map which displays zone status)
// ----------------------------------------------------------------------------

let maxHealth = -1;

var ZoneView = function(mapView, zoneData) {
  this.id = null;
  this.name = null;
  this.x = 0;
  this.y = 0;

  var zone = zoneData;
  var iconSize = 50;
  var lines = null;
  var polygon = null;
  var marker = null;
  var element = null;
  var canvasElement = null;

  var reptilePower = 0;
  var humanPower = 0;

  this.constructor = function() {
    this.id = zone._id;
    this.name = zone.name;
    this.links = zone.links;

    // polygon
    polygon = L.GeoJSON.geometryToLayer({
      type: 'Feature',
      geometry: zone.geometry
    });

    var polygonCenter = polygon.getBounds().getCenter();
    this.x = polygonCenter.lat;
    this.y = polygonCenter.lng;

    var ourStyle = {
      color: '#374a60',
      weight: 3,
      opacity: 1,
      zIndex: 100,
      fillOpacity: 0.05,
      fillColor: '#374a60'
    };

    var ourStyleHover = {
      color: '#4a82c4',
      weight: 4,
      opacity: 1,
      fillOpacity: 0.2,
      zIndex: 100
    };

    var enemyStyle = {
      color: (zone.isVisible ? '#913b31' : '#694743'),
      weight: 2,
      opacity: 0.1,
      fillOpacity: 0.05,
      fillColor: (zone.isVisible ? '#913b31' : '#694743'),
    };

    var enemyStyleHover = {
      color: '#bd5348',
      weight: 2,
      fillOpacity: 0.2,
      opacity: 1
    };

    polygon.setStyle( zone.isEnemy ? enemyStyle : ourStyle );

    polygon.on('mouseover', function (e) {
      polygon.setStyle( zone.isEnemy ? enemyStyleHover : ourStyleHover );
    });

    polygon.on('mouseout', function (e) {
      polygon.setStyle( zone.isEnemy ? enemyStyle : ourStyle );
    });

    // marker
    marker = L.marker(
      [this.x, this.y],
      {
        clickable: false,
        icon: L.divIcon({
          className: 'earth-marker',
          iconSize: [iconSize, iconSize],
          iconAnchor: [iconSize / 2, iconSize / 2]
        })
      }
    );

    // events
    polygon.on('click', this.showPopup.bind(this));

    // debug
    // marker.on('click', function(e) { console.log(zone.name); });

    this.update();
  };

  this.update = function() {
    zone = Game.EarthZones.getByName(this.name);

    this.isVisible = zone.isVisible;
    const isAdmin = Meteor.user().role === 'admin';

    if (this.isVisible || isAdmin) {
      // calculate army power
      let currentHumanHealth = Game.Unit.calcUnitsHealth(zone.userArmy);
      let currentReptileHealth = Game.Unit.calcUnitsHealth(zone.enemyArmy);
      maxHealth = Math.max(currentHumanHealth, currentReptileHealth, maxHealth);

      if (maxHealth > 0) {
        humanPower = Math.round((currentHumanHealth / maxHealth) * 100);
        reptilePower = Math.round((currentReptileHealth / maxHealth ) * 100);
      } else {
        humanPower = 0;
        reptilePower = 0;
      }

      // extend map bounds
      if (mapBounds) {
        mapBounds.extend(L.latLng(polygon.getBounds().getSouthWest()));
        mapBounds.extend(L.latLng(polygon.getBounds().getNorthEast()));
      } else {
        mapBounds = polygon.getBounds();
      }

      if (mapBounds) {
        mapView.setMaxBounds(mapBounds);
      }

      // show on map
      polygon.addTo(mapView);
      marker.addTo(mapView);

      element = $(marker._icon);
      element.html('<canvas></canvas><span></span>');
      canvasElement = element.find('canvas');

      element.removeClass('earth-marker-battle');
      element.removeClass('earth-marker-enemy');
      element.removeClass('earth-marker-our');

      if (zone.enemyArmy && zone.userArmy) {
        polygon.bringToFront();
        element.addClass('earth-marker-battle');
      } else if (zone.isEnemy) {
        polygon.bringToBack();
        element.addClass('earth-marker-enemy');
      } else {
        polygon.bringToFront();
        element.addClass('earth-marker-our');
      }

      mapView.on('zoomend', this.refreshZoom.bind(this));
      this.refreshZoom();

    } else {

      // remove from map
      if (mapView.hasLayer(polygon)) {
        mapView.removeLayer(polygon);
      }
      if (mapView.hasLayer(marker)) {
        mapView.removeLayer(marker);
      }

    }
  };

  this.showPopup = function(e) {
    L.DomEvent.stopPropagation(e);
    if (e && e.latlng) {
      Game.Earth.showZonePopup(zone.name, e.latlng);
    }
  };

  this.hidePopup = Game.Earth.hideZonePopup;

  this.refreshZoom = function() {
    const isAdmin = Meteor.user().role === 'admin';
    if (!zone || !zone.isVisible && !isAdmin) {
      return;
    }

    var zoom = mapView.getZoom();
    var k = Math.pow(2, (zoom - 4));

    if (k > 2) {
      k = 2;
    } else if (k < 1) {
      k = 1;
    }

    element
      .height(iconSize * k)
      .width(iconSize * k)
      .css('margin-top', iconSize * k * -0.5)
      .css('margin-left', iconSize * k * -0.5);

    if (zoom < 5) {
      element.find('span').css('margin-top', iconSize * k * 0.7);
      this.hideProgress();
    } else {
      element.find('span').css('margin-top', iconSize * k * 0.9);
      this.showProgress(humanPower, reptilePower, iconSize * k);
    }
  };

  this.showProgress = function(humans, reptiles, size) {
    canvasElement.show();
    canvasElement
      .css('left', size * -0.5 + 25)
      .css('top', size * -0.5 + 25);

    canvasElement
      .css('left', 0)
      .css('top', 0);

    var canvas = canvasElement[0];
    canvas.width = size;
    canvas.height = size;

    var context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    var x = canvas.width / 2;
    var y = canvas.height / 2;
    var radius = canvas.width / 3;
    var lineWidth = canvas.width / 15;
    var offset = canvas.width / 100;

    // draw enemy progress bar background
    context.beginPath();
    context.arc(x + offset, y, radius, Math.PI * 0.5, Math.PI * -0.5, true);
    context.lineWidth = lineWidth;
    context.strokeStyle = '#4E312D';
    context.stroke();
    // draw enemy progress bar current value
    context.beginPath();
    context.arc(x + offset, y, radius, Math.PI * 0.5, Math.PI * (0.5 - reptiles / 100), true);
    context.lineWidth = lineWidth;
    context.strokeStyle = '#D05F4A';
    context.stroke();
    // draw user progress bar background
    context.beginPath();
    context.arc(x - offset, y, radius, Math.PI * 0.5, Math.PI * 1.5, false);
    context.lineWidth = lineWidth;
    context.strokeStyle = '#374a60';
    context.stroke();
    // draw user progress bar current value
    context.beginPath();
    context.arc(x - offset, y, radius, Math.PI * 0.5, Math.PI * (0.5 + humans / 100), false);
    context.lineWidth = lineWidth;
    context.strokeStyle = '#4a82c4';
    context.stroke();
  };

  this.hideProgress = function() {
    canvasElement.hide();
    var canvas = canvasElement[0];

    var context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  this.updateText = function(value) {
    element.find('span').html(value);
  };

  this.constructor();
};

// ----------------------------------------------------------------------------
// Line view (line on map which displays zone connection + vote result)
// ----------------------------------------------------------------------------

var LineView = function(start, finish, selected) {

  var line = null;
  var text = null;
  var textElement = null;

  this.constructor = function() {
    // create line
    line = new L.Polyline([], {
      clickable: false,
      color: selected ? '#4a82c4' : '#374a60',
      weight: 3,
      smoothFactor: 1
    }).addTo(mapView);
    line.addLatLng(L.latLng(start.x, start.y));
    line.addLatLng(L.latLng(finish.x, finish.y));

    // create line text
    text = new L.marker([
      Math.min(start.x, finish.x) + Math.abs(start.x - finish.x) / 2,
      Math.min(start.y, finish.y) + Math.abs(start.y - finish.y) / 2
    ], {
      clickable: false,
      icon: L.divIcon({
        className: 'earth-marker-connection-text'
      })
    }).addTo(mapView);

    textElement = $(text._icon);
  };

  this.update = function(value) {
    if (textElement) {
      textElement.html('<p>' + value + '</p>');
    }
  };

  this.remove = function() {
    if (line) {
      if (mapView && mapView.hasLayer(line)) {
        mapView.removeLayer(line);
      }
      line = null;
    }

    if (text) {
      if (mapView && mapView.hasLayer(text)) {
        mapView.removeLayer(text);
      }
      text = null;
      textElement = null;
    }
  };

  this.constructor();
};

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

var mapView = null;
var mapBounds = null;
var zoneViews = {};
const lineViews = [];
var observerZones = null;

Template.earth.onRendered(function() {

  if (!mapView) {

    // first time manualy create div inside template
    $('#map-content').html('<div id="map-earth"></div>');

    mapView = L.map('map-earth', {
      crs: L.CRS.Simple,
      zoomAnimation: false,
      zoomControl: false,
      doubleClickZoom: false,
      attributionControl: false,
      fadeAnimation: false,
      inertia: false,
      zoom: 4,
      minZoom: 2,
      maxZoom: 6
    });
    mapView.setView([47.36865, 8.539183], 4);
    mapView.spin(false);

    if (Meteor.settings.public.mapbox && Meteor.settings.public.mapbox.on) {
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        id: Meteor.settings.public.mapbox.id,
        accessToken: Meteor.settings.public.mapbox.accessToken
      }).addTo(mapView);
    }

    mapView.on('click', function(e) {
      Game.Earth.hideZonePopup();
    });

    maxHealth = Game.EarthZones.calcMaxHealth();

    // create existing zones
    var zones = Game.EarthZones.getAll().fetch();
    for (var i = 0; i < zones.length; i++) {
      zoneViews[ zones[i].name ] = new ZoneView(mapView, zones[i]);
    }

    if (mapBounds) {
      mapView.fitBounds(mapBounds);
    }

  } else {

    // put existing map content into template
    $('#map-content').html( mapView._container );

    for (var key in zoneViews) {
      zoneViews[ key ].update();
    }

  }

  // track db updates
  observerZones = Game.EarthZones.getAll().observeChanges({
    changed: function(id, fields) {
      maxHealth = Game.EarthZones.calcMaxHealth();

      var name = Game.EarthZones.Collection.findOne({ _id: id }).name;
      if (mapView && zoneViews) {
        for (var key in zoneViews) {
          zoneViews[ key ].update();
        }
      }
    }
  });

  Game.EarthUnits.Collection.find({}).observeChanges({
    added: function () {
      showLines(Game.EarthUnits.get());
    },
    changed: function() {
      showLines(Game.EarthUnits.get());
    },
    removed: function () {
      showLines(Game.EarthUnits.get());
    }
  });
});

let showLines = function (army) {
  lineViews.forEach( lineView => lineView.remove() );

  lineViews.length = 0;

  if (army) {
    if (Game.EarthZones.getByName(army.zoneName).battleID) {
      return;
    }

    let armyZone = zoneViews[army.zoneName];
    armyZone.links.forEach(function (name) {
      let finish = zoneViews[name];
      if (finish && finish.isVisible) {
        let selected = (name === army.commandTarget);
        lineViews.push(new LineView(armyZone, finish, selected));
      }
    });
  }
};

Template.earth.onDestroyed(function() {
  Game.Earth.hideZonePopup();

  if (observerZones) {
    observerZones.stop();
    observerZones = null;
  }

  /* Code for map remove
  zoneViews = {};
  lineViews = {};

  if (mapView) {
    mapView.remove();
    mapView = null;
    mapBounds = null;
  }
  */
});

};