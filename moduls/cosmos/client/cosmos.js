initCosmosClient = function() {

initCosmosLib();
initCosmosPathView();

Meteor.subscribe('planets');
Meteor.subscribe('spaceEvents');

// TODO: Подумать что делать с этими двумя переменными!
var mapView = null;
var pathViews = {};

Game.Cosmos.showPage = function() {
	this.render('cosmos', {
		to: 'content'
	});
}

// ----------------------------------------------------------------------------
// Fleets side menu
// ----------------------------------------------------------------------------

Game.Cosmos.showFleetsInfo = function() {
	Router.current().render('cosmosFleetsInfo', {
		to: 'cosmosSideInfo'
	});
}

Template.cosmosFleetsInfo.helpers({
	userFleets: function () {
		var result = [];
		var fleets = Game.SpaceEvents.getFleets().fetch();	
		for (var i = 0; i < fleets.length; i++) {
			if (!fleets[i].info.isHumans) {
				continue;
			}
			var info = {
				id: fleets[i]._id,
				start: Game.Planets.getOne( fleets[i].info.startPlanetId ),
				finish: Game.Planets.getOne( fleets[i].info.targetId )
			}
			result.push(info);
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
			var info = {
				id: fleets[i]._id,
				start: Game.Planets.getOne( fleets[i].info.startPlanetId ),
				finish: Game.Planets.getOne( fleets[i].info.targetId )
			}
			result.push(info);
		}
		return (result.length > 0) ? result : null;
	}
});

Template.cosmosFleetsInfo.events({
	'click .fleet': function (e, t) {
		var id = $(e.currentTarget).attr('data-id');
		var path = pathViews[id];
		var spaceEvent = Game.SpaceEvents.getOne(id);

		if (path && spaceEvent) {
			var currentTime = Session.get('serverTime');
			var timeLeft = spaceEvent.timeEnd - currentTime;
			var timeTotal = spaceEvent.timeEnd - spaceEvent.timeStart;
			var timeCurrent = currentTime - spaceEvent.timeStart;

			var a = spaceEvent.info.startPosition;
			var b = spaceEvent.info.targetPosition;
			var totalFlyDistance = Math.sqrt( Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) );

			var maxSpeed = Game.Planets.calcMaxSpeed( spaceEvent.info.engineLevel );
			var acceleration = Game.Planets.calcAcceleration( spaceEvent.info.engineLevel );

			var currentDistance = Game.Planets.calcDistanceByTime(
				timeCurrent,
				totalFlyDistance,
				maxSpeed,
				acceleration
			);

			var k = currentDistance / totalFlyDistance;
			var position = path.getPointAlongDistanceByCoef(k);

			mapView.setView([position.x, position.y], 8);
		}
	}
})

// ----------------------------------------------------------------------------
// Planet side menu
// ----------------------------------------------------------------------------

Game.Cosmos.showPlanetInfo= function(id) {
	Router.current().render('cosmosPlanetInfo', {
		to: 'cosmosSideInfo',
		data: {
			id: id
		}
	});
}

Game.Cosmos.getPlanetInfo = function(planet) {
	if (!planet) {
		return null;
	}

	var info = {};

	info.id = planet._id;
	info.name = planet.name;
	info.type = Game.Planets.getType(planet.type).name;

	if (planet.isHome || planet.armyId) {
		info.isHumans = true;
		info.isHome = true;
		info.status = (planet.isHome) ? 'Планета консула' : 'Колония';
		if (Game.Planets.getColonies().length <= 1) {
			info.canSend = false;
		} else {
			info.canSend = true;
		}
	} else {
		info.isHumans = false;
		info.canSend = true;
	}
	
	if (planet.mission) {
		info.mission = {
			level: planet.mission.level,
			name: Game.Battle.items[planet.mission.type].name
		}
	}

	var units = Game.Planets.getFleetUnits(planet._id);
	if (units) {
		var side = (planet.mission) ? 'reptiles' : 'army';
		info.units = [];

		for (var key in units) {
			if (!_.isString( units[key] ) && units[key] <= 0) {
				continue;
			}

			info.units.push({
				engName: key,
				name: Game.Unit.items[side].fleet[key].name,
				count: _.isString( units[key] ) ? game.Battle.count[ units[key] ] : units[key]
			})
		}
	}

	return info;
}

Template.cosmosPlanetInfo.helpers({
	planet: function() {
		var id = Template.instance().data.id;
		var planet = Game.Planets.getOne(id);
		return Game.Cosmos.getPlanetInfo(planet);
	}
});

Template.cosmosPlanetInfo.events({
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
// Planets popup
// ----------------------------------------------------------------------------

Game.Cosmos.getPlanetPopupInfo = function(planet) {
	if (!planet) {
		return null;
	}

	// ----------------------------
	// TODO: Get real info!
	return {
		name: planet.name,
		type: Game.Planets.getType(planet.type).name,
		items: [{
			name: Game.Artefacts.getRandom().engName,
			chance: Math.round(Math.random() * 50 + 25)
		}, {
			name: Game.Artefacts.getRandom().engName,
			chance: Math.round(Math.random() * 50 + 25)
		}, {
			name: Game.Artefacts.getRandom().engName,
			chance: Math.round(Math.random() * 50 + 25)
		}]
	};
	// ----------------------------
}

Game.Cosmos.showPlanetPopup = function(id) {
	var planet = Game.Planets.getOne(id);
	var dropInfo = Game.Cosmos.getPlanetPopupInfo(planet);
	if (!dropInfo) {
		return;
	}

	Router.current().render('cosmosPlanetPopup', {
		to: 'cosmosPopupContent',
		data: {
			drop: dropInfo,
			position: function() {
				var k = Math.pow(2, (mapView.getZoom() - 7));
				var iconSize = (planet.size + 3) * 4;
				var position = mapView.latLngToContainerPoint(new L.latLng(planet.x, planet.y));
				position.x += 24 + 10 + Math.round(iconSize * k / 2);
				position.y -= 85;
				position.x -= 562;
				position.y -= 217.5;
				return position;
			}
		}
	});
}

Game.Cosmos.hidePlanetPopup = function() {
	Router.current().render(null, {
		to: 'cosmosPopupContent'
	});
}

// ----------------------------------------------------------------------------
// Ship side menu
// ----------------------------------------------------------------------------

Game.Cosmos.showShipInfo = function(id) {
	Router.current().render('cosmosShipInfo', {
		to: 'cosmosSideInfo',
		data: {
			id: id
		}
	});
}

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
		info.status = 'Флот консула';
	} else {
		info.isHumans = false;
		info.canSend = true;
		info.mission = {
			level: spaceEvent.info.mission.level,
		name: Game.Battle.items[spaceEvent.info.mission.type].name
		}
		info.status = 'Флот рептилий';
	}

	var units = Game.SpaceEvents.getFleetUnits(spaceEvent._id);
	if (units) {
		var side = (spaceEvent.info.isHumans) ? 'army' : 'reptiles';
		info.units = [];

		for (var key in units) {
			if (!_.isString( units[key] ) && units[key] <= 0) {
				continue;
			}

			info.units.push({
				engName: key,
				name: Game.Unit.items[side].fleet[key].name,
				count: _.isString( units[key] ) ? game.Battle.count[ units[key] ] : units[key]
			})
		}
	}

	return info;
}

Template.cosmosShipInfo.onRendered(function() {
	// show fleets info when ship removed
	this.autorun(function() {
		var id = Template.currentData().id;
		var spaceEvent = Game.SpaceEvents.getOne( id );
		if (!spaceEvent) {
			Game.Cosmos.showFleetsInfo();
		}
	});
});

Template.cosmosShipInfo.helpers({
	timeLeft: function() {
		var id = Template.instance().data.id;
		var spaceEvent = Game.SpaceEvents.getOne(id);
		return (!spaceEvent) ? 0 : spaceEvent.timeEnd - Session.get('serverTime');
	},

	ship: function() {
		var id = Template.instance().data.id;
		var spaceEvent = Game.SpaceEvents.getOne(id);
		return Game.Cosmos.getShipInfo(spaceEvent);
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

Game.Cosmos.showAttackMenu = function(id) {
	Router.current().render('cosmosAttackMenu', {
		to: 'cosmosAttackMenu',
		data: {
			id: id,
			activeColonyId: new ReactiveVar(null),

			getColonies: function() {
				var result = Game.Planets.getColonies();

				var maxCount = Game.Planets.getMaxColoniesCount();
				var sentCount = Game.SpaceEvents.getSentToColonyCount();

				var n = result.length;
				while (n-- > 0) {
					if (result[n]._id == id) {
						result.splice(n, 1);
						maxCount -= 1;
						break;
					}
				}

				for (var i = result.length; i < maxCount; i++) {
					result.push({
						isEmpty: true,
						isSent: (sentCount > 0 ? true : false)
					});
					sentCount--;
				}

				return result;
			}
		}
	});
}

Game.Cosmos.hideAttackMenu = function() {
	Router.current().render(null, {
		to: 'cosmosAttackMenu'
	})
}

Template.cosmosAttackMenu.helpers({
	ship: function() {
		var id = Template.instance().data.id;
		var spaceEvent = Game.SpaceEvents.getOne(id);
		return Game.Cosmos.getShipInfo(spaceEvent);
	},

	planet: function() {
		var id = Template.instance().data.id;
		var planet = Game.Planets.getOne(id);
		return Game.Cosmos.getPlanetInfo(planet);
	},

	timeAttack: function() {
		var baseId = Template.instance().data.activeColonyId.get();
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
	},

	timeLeft: function() {
		var targetId = Template.instance().data.id;
		var targetShip = Game.SpaceEvents.getOne(targetId);
		if (targetShip) {
			return targetShip.timeEnd - Session.get('serverTime');
		}

		return null;
	},

	colonies: function() {
		return Template.instance().data.getColonies();
	},

	activeColonyId: function() {
		return Template.instance().data.activeColonyId.get();
	},

	availableFleet: function() {
		var colonyId = Template.instance().data.activeColonyId.get();
		if (!colonyId) {
			return null;
		}

		var army = Game.Planets.getFleetUnits(colonyId);
		if (!army) {
			return null;
		}

		var units = [];

		for (var key in army) {
			if (army[key] <= 0) {
				continue;
			}
			
			units.push({
				engName: key,
				name: Game.Unit.items.army.fleet[key].name,
				max: army[key],
				count: 0
			});
		}

		return units;
	},

	canHaveMoreColonies: function() {
		return Game.Planets.checkCanHaveMoreColonies();
	}
});

Template.cosmosAttackMenu.onRendered(function() {
	var colonies = this.data.getColonies();
	if (colonies && colonies.length > 0) {
		this.data.activeColonyId.set( colonies[0]._id);
	}
});

Template.cosmosAttackMenu.events({
	'click .btn-close': function(e, t) {
		Game.Cosmos.hideAttackMenu();
	},

	'click .planets li': function(e, t) {
		var id = $(e.currentTarget).attr("data-id");
		if (id) {
			t.data.activeColonyId.set( id );
		}
	},

	'click .btn-all': function(e, t) {
		$('.fleet li').each(function(index, element) {
			var max = Number( $(element).find('.max').html() );
			$(element).find('.count').val( max );
		});
	},

	'change .fleet input': function (e, t) {
		var value = parseInt( e.currentTarget.value );
		var max = parseInt( $(e.currentTarget).attr('data-max') );

		if (value < 0) {
			e.currentTarget.value = 0;
		} else if (value > max) {
			e.currentTarget.value = max;
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
		var units = {};

		$('.fleet li').each(function(index, element) {
			var id = $(element).attr('data-id');
			var max = parseInt( $(element).attr('data-max') );
			var count = parseInt( $(element).find('.count').val() );

			if (max > 0 && count > 0) {
				units[ id ] = Math.min(max, count);
				total += units[ id ];
			}

			$(element).find('.count').val(0);
		});

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
			Meteor.call('planet.sendFleet', basePlanet._id, targetId, units, isOneway);

		} else if (ship) {
			// Attack ship
			var pathView = pathViews[ship._id];
			var engineLevel = Game.Planets.getEngineLevel();

			var attack = Game.Planets.calcAttackOptions(
				basePlanet,
				engineLevel,
				ship,
				Session.get('serverTime')
			)

			if (!attack || !pathView) {
				Notifications.info('Невозможно перехватить вражеский флот');
				return;
			}

			var attackPoint = pathView.getPointAlongDistanceByCoef(attack.k)

			Meteor.call(
				'spaceEvents.attackReptFleet',
				basePlanet._id,
				targetId,
				units,
				attackPoint.x, 
				attackPoint.y
			);
		}

		Game.Cosmos.showFleetsInfo();
		Game.Cosmos.hideAttackMenu();

		Notifications.success('Флот отправлен');
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

	// Init planets
	var alignMapToBasePlanet = function() {
		var homePlanet = Game.Planets.getBase();
		if (homePlanet) {
			mapView.setView([homePlanet.x, homePlanet.y], 7);
		}
	}

	var planets = Game.Planets.getAll().fetch();
	if (planets.length == 0) {
		Meteor.call('planet.initialize', function(err, data) {
			alignMapToBasePlanet();
		});
	} else {
		alignMapToBasePlanet();
	}

	// First update
	Meteor.call('spaceEvents.updateAll');
	Meteor.call('planet.updateAll');

	// Paths
	var createPath = function(id, event) {
		if (pathViews[id]) {
			return; // already created
		}

		// calc offsets
		/*
		var startOffset = 0;
		if (event.info.startPlanetId) {
			var planet = Game.Planets.getOne(event.info.startPlanetId);
			if (planet) {
				startOffset = (planet.size + 3) * 0.02;
			}
		}

		var endOffset = 0;
		if (event.info.targetType == Game.SpaceEvents.target.PLANET) {
			var planet = Game.Planets.getOne(event.info.targetId);
			if (planet) {
				endOffset = (planet.size + 3) * 0.02;
			}
		}
		*/
		var startOffset = 0;
		var endOffset = 0;

		// draw path
		pathViews[id] = new game.PathView(
			mapView,
			event.info.startPosition,
			event.info.targetPosition,
			startOffset,
			endOffset,
			(event.info.isHumans ? '#56BAF2' : '#DC6257')
		);
	}

	var removePath = function(id) {
		if (pathViews[id]) {
			pathViews[id].remove();
			pathViews[id] = null;
		}
	}

	Game.SpaceEvents.getAll().observeChanges({
		added: function(id, event) {
			if (event.type == Game.SpaceEvents.type.SHIP) {
				createPath(id, event);

				// update event on time end
				Tracker.autorun(function(c) {
					if (event.timeEnd <= Session.get('serverTime')) {
						c.stop();
						Meteor.call('spaceEvents.update', id);
					}
				});
			}
		},

		removed: function(id) {
			removePath(id);
		}
	});

	// Render cosmos objects
	// Add layer for markers
	$(mapView.getContainer()).append('<div class="leaflet-marker-pane"></div>');

	var zoom = new ReactiveVar(mapView.getZoom());
	mapView.on('zoomend', function(e) {
		zoom.set( mapView.getZoom() );
	});

	var bounds = new ReactiveVar(mapView.getBounds());
	mapView.on('moveend', function(e) {
		bounds.set( mapView.getBounds() );
	});

	Template.cosmosObjects.helpers({
		zoom: function() {
			return Template.instance().data.zoom.get();
		},

		getPlanetPosition: function(x, y, iconSize) {
			var zoom = Template.instance().data.zoom.get();
			var k = Math.pow(2, (zoom - 7));
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
			}
		},

		getFleetAnimation: function(fleet) {
			var zoom = Template.instance().data.zoom.get();
			var currentTime = Session.get('serverTime');
			
			var path = pathViews[ fleet.spaceEvent._id ];
			if (!path) {
				return {
					x: 0,
					y: 0,
					angle: 0
				}
			}

			var timeLeft = fleet.spaceEvent.timeEnd - currentTime;
			var timeTotal = fleet.spaceEvent.timeEnd - fleet.spaceEvent.timeStart;
			var timeCurrent = currentTime - fleet.spaceEvent.timeStart;

			var currentDistance = Game.Planets.calcDistanceByTime(
				timeCurrent,
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
			}
		},

		isHidden: function(x, y) {
			var bounds = Template.instance().data.bounds.get();
			if (bounds.contains(new L.latLng(x, y))) {
				return false;
			} else {
				return true;
			}
		}
	});
 
	Blaze.renderWithData(
		Template.cosmosObjects, {
			zoom: zoom,
			bounds: bounds,

			planets: function() {
				var planets = Game.Planets.getAll().fetch();
				return _.map(planets, function(planet) {
					return {
						iconSize: (planet.size + 3) * 4,
						planet: planet
					};
				})
			},

			fleets: function() {
				var fleets = Game.SpaceEvents.getFleets().fetch();
				return _.map(fleets, function(spaceEvent) {

					var a = spaceEvent.info.startPosition;
					var b = spaceEvent.info.targetPosition;
					var totalFlyDistance = Math.sqrt( Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) );

					return {
						spaceEvent: spaceEvent,
						maxSpeed: Game.Planets.calcMaxSpeed( spaceEvent.info.engineLevel ),
						acceleration: Game.Planets.calcAcceleration( spaceEvent.info.engineLevel ),
						totalFlyDistance: totalFlyDistance
					};
				})
			}
		},
		$('.leaflet-marker-pane')[0]
	);

	// Align map to nearest planet
	// TODO: Избавиться от подергивания при наведении!
	/*
	var curLatLng = null;
	var zoomLatLng = null;
	var lastZoom = null;

	var alingMapToNearestPlanet = function(position) {
		var minDistance = Infinity;
		var currentDistance = 0;
		var nearest = null;

		var planets = Game.Planets.getAll().fetch();
		for (var i = 0; i < planets.length; i++) {
			currentDistance = Game.Planets.calcDistance(position, planets[i]);
			if (minDistance > currentDistance) {
				minDistance = currentDistance;
				nearest = planets[i];
			}
		}

		if (nearest) {
			var point1 = mapView.latLngToContainerPoint(new L.latLng(position.x, position.y));
			var point2 = mapView.latLngToContainerPoint(new L.latLng(nearest.x, nearest.y));
			if (Game.Planets.calcDistance(point1, point2) < 100) {
				mapView.setView([nearest.x, nearest.y], mapView.getZoom(), { animate: false });
			}
		}
	}

	mapView.on('zoomstart', function(e) {
		zoomLatLng = new L.latLng(curLatLng.lat, curLatLng.lng);
		lastZoom = mapView.getZoom();
	});

	mapView.on('zoomend', function(e) {
		if (lastZoom && lastZoom < mapView.getZoom() && zoomLatLng) {
			alingMapToNearestPlanet({
				x: zoomLatLng.lat,
				y: zoomLatLng.lng
			});
		}
	});

	mapView.on('mousemove', function(e) {
		curLatLng = e.latlng;
	})
	*/

	// Show default side info
	Game.Cosmos.showFleetsInfo();

	mapView.on('click', function(e) {
		Game.Cosmos.showFleetsInfo();
	});

	mapView.on('movestart', function(e) {
		Game.Cosmos.hidePlanetPopup();
	});

	mapView.on('zoomstart', function(e) {
		Game.Cosmos.hidePlanetPopup();
	})
});

Template.cosmos.onDestroyed(function() {
	// TODO: Maybe clear map or event listeners?!
	mapView = null;
	pathViews = {};
});

Template.cosmos.helpers({
	
});

Template.cosmos.events({
	'click .map-fleet': function(e, t) {
		var id = $(e.currentTarget).attr('data-id');
		if (id) {
			Game.Cosmos.showShipInfo(id);	
		}
	},

	'click .map-planet-marker': function(e, t) {
		var id = $(e.currentTarget).attr('data-id');
		if (id) {
			Game.Cosmos.showPlanetInfo(id);
		}
	},

	'mouseover .map-planet-marker': function(e, t) {
		// TODO: Remove comment when artefacts ready!
		// var id = $(e.currentTarget).attr('data-id');
		// Game.Cosmos.showPlanetPopup(id);
	},

	'mouseout .map-planet-marker': function(e, t) {
		Game.Cosmos.hidePlanetPopup();
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
			if (hand % 2 == 0) {
				color = (segment % 2 == 0) ? '#ffff00' : '#ff0000';
			} else {
				color = (segment % 2 == 0) ? '#ffffff' : '#5555ff';
			}
		}

		for (var i = 0; i < points.length; i++) {
			L.circle([points[i].x, points[i].y], 0.1, {
				color: color,
				fillOpacity: 1
			}).addTo(mapView);
		}

		return amount;
	}

	var totalPlanets = debugDrawSegment(0, 0);

	for (var i = 0; i < hands; i++) {
		for (var j = 1; j <= segments; j++) {
			totalPlanets += debugDrawSegment(i, j);
		}
	}

	console.log('Total planets generated: ', totalPlanets);
}

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

		if (i % 10 == 0) {
			console.log('================================================');
		}
		console.log(strDebug);
	}
}

}