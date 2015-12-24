var initCosmosClient = function() {

initCosmosLib();

Meteor.subscribe('planets');
Meteor.subscribe('spaceEvents');

Game.Cosmos.showPage = function() {
	this.render('cosmos', {to: 'content'});
}

// ----------------------------------------------------------------------------
// PLANET VIEW
// ----------------------------------------------------------------------------

var PlanetView = function(map, planet) {

	this.id = null;
	this.name = null;
	this.iconSize = 0;
	this.zoom = 0;
	this.radius = 0;
	this.x = 0;
	this.y = 0;

	this.element = null;
	this.marker = null;
	this.textName = null;
	this.markerAttack = null;
	this.isMarkerAttack = false;

	this.infoPlanet = null;
	this.infoDrop = null;

	this.constructor = function(map, planet) {
		this.id = planet._id;
		this.name = planet.name;
		this.iconSize = (planet.size + 3) * 4;
		this.radius = this.iconSize * 0.5 / 100;
		this.x = planet.x;
		this.y = planet.y;

		// Planet marker on map
		this.marker = L.marker(
			[this.x, this.y],
			{
				icon: L.divIcon({
					className: 'map-planet-marker ' + planet.type,
					iconSize: [this.iconSize, this.iconSize],
					iconAnchor: [this.iconSize * 0.5, this.iconSize * 0.5]
				})
			}
		).addTo(map);

		// Planet jquery element
		this.element = $(this.marker.getElement());

		// Planet name
		this.element.append('<div class="map-planet-marker-name">' + planet.name + '</div>');
		this.textName = $(this.element.find('.map-planet-marker-name'));
		this.textName.hide();

		// Attack marker
		this.element.append('<div class="map-planet-attack-cursor"></div>');
		this.markerAttack = $(this.element.find('.map-planet-attack-cursor'));
		this.markerAttack.hide();

		// Events
		this.marker.on('mouseover', this.showPopup.bind(this));
		this.marker.on('mouseout', this.hidePopup.bind(this));
		this.marker.on('click', this.showSideBarInfo.bind(this));

		map.on('move', this.refreshAnim.bind(this));
		map.on('zoomend', this.refreshSize.bind(this));

		this.refreshAnim();
		this.refreshSize();

		// GUI data
		// ----------------------------
		// TODO: Get real info!
		// ----------------------------
		this.infoPlanet = null;

		this.infoDrop = {
			segment: planet.segment,
			hand: planet.hand,
			name: planet.name,
			type: Game.Planets.getType(planet.type).name,
			items: [{
				name: 'green' + Math.round(Math.random() * 4 + 1),
				chance: Math.round(Math.random() * 50 + 25)
			}, {
				name: 'purple' + Math.round(Math.random() * 4 + 1),
				chance: Math.round(Math.random() * 50 + 25)
			}, {
				name: 'orange' + Math.round(Math.random() * 4 + 1),
				chance: Math.round(Math.random() * 50 + 25)
			}]
		};
		// ----------------------------
		// TODO: Get real info!
		// ----------------------------
	}

	this.update = function() {
		var planet = Game.Planets.getOne(this.id);

		this.element.removeClass('map-planet-border-blue');
		this.element.removeClass('map-planet-border-red');
		this.element.removeClass('map-planet-border-white');

		if (planet.isHome) {
			this.element.addClass('map-planet-border-blue');
		} else {
			if (planet.mission) {
				this.element.addClass('map-planet-border-red');
			} else {
				this.element.addClass('map-planet-border-white');
			}
		}

		// ----------------------------
		// TODO: Update real info!
		// ----------------------------
		var info = {
			id: planet._id,
			name: planet.name,
			type: Game.Planets.getType(planet.type).name,
			metals: 100500,
			crystals: 100542
		};
		if (planet.isHome) {
			info.isHome = true;
		}
		//if (planet.state == 'IDLE') {
			info.canSend = true;
		//}
		if (planet.mission) {
			var config = Game.Battle.items[planet.mission.type];
			info.mission = {
				level: planet.mission.level,
				name: config.name,
				enemies: _.map( config.level[planet.mission.level].enemies, function(value, key) {
					return {
						name: game.reptiles.rfleet[key].name,
						engName: key,
						count: _.isString(value) ? game.Battle.count[value] : value
					}
				})
			};
		}
		// ----------------------------
		// TODO: Update real info!
		// ----------------------------

		// save info
		this.infoPlanet = info;

		// update side menu
		var sideInfo = Session.get('planet');
		if (sideInfo && sideInfo.id == this.id) {
			Session.set('planet', this.infoPlanet);
		}
	}

	this.setAttackTime = function(time) {
		if (time <= 0) {
			this.isMarkerAttack = false;
			this.markerAttack.hide();
		} else {
			this.isMarkerAttack = true;
			this.markerAttack.html(time + '&nbsp;sec.');
			if (this.map.getZoom() >= 8) {
				this.markerAttack.show();
			}
		}
	}

	this.showPopup = function() {
		Session.set('drop', this.infoDrop);

		var k = Math.pow(2, (map.getZoom() - 7));
		var position = map.latLngToContainerPoint(this.marker.getLatLng());
		position.x += 124 + 10 + Math.round(this.iconSize * k / 2);
		position.y -= 85;

		$('.map-planet-popup-container')
			.css('left', position.x + 'px')
			.css('top', position.y + 'px');
	}

	this.hidePopup = function() {
		Session.set('drop', null);
	}

	this.showSideBarInfo = function() {
		Session.set('planet', this.infoPlanet);
	}

	this.refreshAnim = function() {
		var bounds = map.getBounds();
		var zoom = map.getZoom();

		if (bounds.contains(this.marker.getLatLng())) {
			this.element.removeClass('map-planet-marker-hidden');
			if (zoom > 7) {
				this.element.addClass('map-planet-marker-animated');
			} else {
				this.element.removeClass('map-planet-marker-animated');
			}
			this.refreshSize(zoom);
		} else {
			this.element.addClass('map-planet-marker-hidden');
			this.element.removeClass('map-planet-marker-animated');
		}
	}

	this.refreshSize = function() {
		var zoom = map.getZoom();

		if (this.zoom == zoom
		 ||	this.element.hasClass('map-planet-marker-hidden')
		) {
			return;
		}
		this.zoom = zoom;

		var k = Math.pow(2, (zoom - 7));
		// planet size & anchor
		this.element
			.height(this.iconSize * k)
			.width(this.iconSize * k)
			.css('margin-top', this.iconSize * k * -0.5)
			.css('margin-left', this.iconSize * k * -0.5);
		// attack cursor position
		if (zoom < 8 || !this.isMarkerAttack) {
			this.markerAttack.hide();
		} else {
			this.markerAttack.show();
		}
		this.markerAttack
			.css('top', this.iconSize * k + 5)
			.css('left', -50 + this.iconSize * k * 0.5);
		// name position
		if (zoom < 8) {
			this.textName.hide();
		} else {
			this.textName.show();
		}
		this.textName
			.css('top', -30)
			.css('left', -100 + this.iconSize * k * 0.5);
	}

	this.getPosition = function() {
		return {
			x: this.x,
			y: this.y
		}
	}

	this.constructor(map, planet);
}

// ----------------------------------------------------------------------------
// SHIP VIEW
// ----------------------------------------------------------------------------

var ShipView = function(map, spaceEvent) {

	var STATE_REMOVED = 0;
	var STATE_WAIT = 1;
	var STATE_FLY = 2;
	var STATE_ARRIVED = 3;

	var _state = 0;
	var _updateInterval = 1;

	var _pathView = null;
	var _element = null;
	var _marker = null;
	var _markerTime = null;

	this.id = null;
	this.info = null;

	this.constructor = function(map, spaceEvent) {

		this.id = spaceEvent._id;

		// ----------------------------
		// TODO: Get real info!
		// ----------------------------

		var flyTime = spaceEvent.timeEnd - spaceEvent.timeStart; // debug

		if (spaceEvent.info.isHumans) {
			this.info = {
				id: '',
				event_id: spaceEvent._id,
				name: 'Наш флот',
				type: flyTime + ' s', // debug
				metals: 100500,
				crystals: 100542,
				canSend: false,
				mission: null
			};
		} else {
			this.info = {
				id: '',
				event_id: spaceEvent._id,
				name: 'Флот рептилоидов',
				type: flyTime + ' s', // debug
				metals: 100500,
				crystals: 100542,
				canSend: true,
				mission: {
					level: 7,
					name: 'Продам гараж',
					enemies: [
						{ name: 'Клинок', count: 100500 },
						{ name: 'Дракон', count: 42 }
					]
				}
			};
		}
		// ----------------------------
		// TODO: Get real info!
		// ----------------------------

		_state = STATE_WAIT;
		this.update();
	}

	this.update = function() {

		var serverTime = Session.get('serverTime');

		switch (_state) {

			case STATE_WAIT:
				if (serverTime >= spaceEvent.timeStart) {
					if (serverTime < spaceEvent.timeEnd) {
						_state = STATE_FLY;
						this.showShipAnimation();
						this.updateShipAnimation();
					} else {
						_state = STATE_ARRIVED;
						Meteor.call('spaceEvents.update', spaceEvent._id);
					}
				}
				break;

			case STATE_FLY:
				if (serverTime < spaceEvent.timeEnd) {
					this.updateShipAnimation();
				} else {
					_state = STATE_ARRIVED;
					this.hideShipAnimation();
					Meteor.call('spaceEvents.update', spaceEvent._id);
				}
				break;
		}

		if (_state == STATE_WAIT || _state == STATE_FLY) {
			setTimeout(this.update.bind(this), _updateInterval * 1000);
		}
	}

	this.remove = function() {
		_state == STATE_REMOVED;
		this.hideShipAnimation();
	}

	this.showShipAnimation = function() {
		_pathView = new PathView(map,
		                         spaceEvent.info.startPosition,
		                         spaceEvent.info.targetPosition, 
		                         (spaceEvent.info.isHumans ? '#56BAF2' : '#DC6257'));

		_marker = L.marker(
			[0, 0],
			{
				icon: L.divIcon({
					className: 'map-fleet'
				})
			}
		).addTo(map);

		_element = $(_marker.getElement());

		if (spaceEvent.info.isHumans) {
			_element.append('<div class="map-fleet-humans"></div>');
		} else {
			_element.append('<div class="map-fleet-rept"></div>');
		}

		_element.append('<div class="map-fleet-time"></div>');
		_markerTime = $(_element.find('.map-fleet-time'));

		_marker.on('click', this.showSideInfo.bind(this));
	}

	this.showSideInfo = function() {
		Session.set('planet', this.info);
	}

	this.updateShipAnimation = function() {

		var timeLeft = spaceEvent.timeEnd - Session.get('serverTime');
		var timeTotal = spaceEvent.timeEnd - spaceEvent.timeStart;
		var timeCurrent = Session.get('serverTime') - spaceEvent.timeStart;

		// TODO: Шпили вили ололо!!!!!!!!
		var shipAcc = Game.Planets.calcAcceleration(0);
		var shipSpeed = Game.Planets.calcMaxSpeed(0);

		var totalDistance = Math.sqrt( Math.pow(spaceEvent.info.targetPosition.x - spaceEvent.info.startPosition.x, 2) + Math.pow(spaceEvent.info.targetPosition.y - spaceEvent.info.startPosition.y, 2) );
		var currentDistance = Game.Planets.calcFlyDistanceByTime(timeCurrent, totalDistance, shipSpeed, shipAcc);

		var k = currentDistance / totalDistance;
		//var k = timeCurrent / timeTotal;
		var curPoint = _pathView.getPointAlongDistanceByCoef(k);
		
		_marker.setLatLng(L.latLng(
			curPoint.x,
			curPoint.y
		));

		var nextPoint = spaceEvent.info.targetPosition;
		if (k < 0.99) {
			nextPoint = _pathView.getPointAlongDistanceByCoef(k + 0.01);
		}
		var angle = Math.atan2(nextPoint.y - curPoint.y, nextPoint.x - curPoint.x);
		this.setRotation(angle);

		_markerTime.html(Math.round(timeLeft) + '&nbsp;sec.')
		           .css('left', 30 * Math.cos(angle))
		           .css('top', 30 * Math.sin(angle));
	}

	this.hideShipAnimation = function() {
		if (_marker) {
			map.removeLayer(_marker);
			_marker = null;
		}
		if (_pathView) {
			_pathView.remove();
			_pathView = null;
		}
	}

	this.setRotation = function(value) {
		if (spaceEvent.info.isHumans) {
			var deg = Math.floor( value * 180 / Math.PI ) + 180;
			_element.find('.map-fleet-humans').css('transform', 'rotate(' + deg + 'deg)');
		} else {
			var deg = Math.floor( value * 180 / Math.PI );
			_element.find('.map-fleet-rept').css('transform', 'rotate(' + deg + 'deg)');
		}
	}

	this.getTimeLeft = function() {
		return spaceEvent.timeEnd - Session.get('serverTime');
	}

	this.getAttackPoint = function() {

		// TODO: Шпили вили !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		var basePlanet = Game.Planets.getBase();
		var timeAttack = Game.Planets.calcAttackFlyTime(basePlanet,
		                                                spaceEvent.info.startPosition,
		                                                spaceEvent.info.targetPosition,
		                                                spaceEvent.timeEnd - spaceEvent.timeStart);

		var timeTotal = spaceEvent.timeEnd - spaceEvent.timeStart;
		var k = 1 - ( spaceEvent.timeEnd - Session.get('serverTime') - timeAttack ) / timeTotal;

		return _pathView.getPointAlongDistanceByCoef(k);
	}

	this.constructor(map, spaceEvent);
}

// ----------------------------------------------------------------------------
// PATH VIEW
// ----------------------------------------------------------------------------

var PathView = function(map, startPoint, endPoint, color) {

	var hitLineVsCircle = function(x1, y1, x2, y2, cx, cy, cRad) {
		var a = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
		var b = 2 * ((x2 - x1) * (x1 - cx) +(y2 - y1) * (y1 - cy));
		var cc = cx * cx + cy * cy + x1 * x1 + y1 * y1 - 2 * (cx * x1 + cy * y1) - cRad * cRad;
		var deter = b * b - 4 * a * cc;
		if (deter <= 0) {
			return false;
		} else {
			var e = Math.sqrt (deter);
			var u1 = ( - b + e ) / (2 * a );
			var u2 = ( - b - e ) / (2 * a );
			if ((u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1)) {
				return false;
			}
		}
		return true;
	}

	var calcDistanse = function(ax, ay, bx, by) {
		return Math.sqrt( Math.pow(bx - ax, 2) + Math.pow(by - ay, 2) );
	}

	var buildSpline = function(points) {
		var coords = [];
		for (var i = 0; i < points.length; i++) {
			coords.push([points[i].x, points[i].y]);
		}

		var line = {
			"type": "Feature",
			"properties": {
				"stroke": "#f00"
			},
			"geometry": {
				"type": "LineString",
				"coordinates": coords
			}
		};

		var curved = turf.bezier(line, 20000, 0.4);
		curved.properties = { stroke: '#0f0' };

		var coords = curved.geometry.coordinates;
		var result = [];
		for (var i = 0; i < coords.length; i++) {
			result.push({
				x: coords[i][0],
				y: coords[i][1]
			});
		}

		return result;
	}

	var findNewPoint = function(startPoint, midPlanet, angle, isTop) {
		var tmpAng = angle + Math.PI * (isTop ? -0.5: 0.5);
		var tmpDist = midPlanet.radius + 0.1;
		return {
			x: midPlanet.x + Math.cos(tmpAng) * tmpDist,
			y: midPlanet.y + Math.sin(tmpAng) * tmpDist
		};
	}

	var getIntersectedPlantents = function(point1, point2) {
		var planets = [];
		var minRadius = Game.Planets.MIN_PLANET_DISTANCE / 2;

		for (var id in planetViews) {
			var planetView = planetViews[id];

			if (calcDistanse(point1.x, point1.y, planetView.x, planetView.y) < minRadius) continue;
			if (calcDistanse(point2.x, point2.y, planetView.x, planetView.y) < minRadius) continue;

			if (hitLineVsCircle(point1.x, point1.y, point2.x, point2.y, planetView.x, planetView.y, planetView.radius)) {
				planets.push(planetView);
			}
		}

		if (planets.length <= 0) {
			return []; // no intersections
		}

		// sort
		planets.sort(function(a, b) {
			var da = calcDistanse(point1.x, point1.y, a.x, a.y);
			var db = calcDistanse(point1.x, point1.y, b.x, b.y);
			if (da < db) return -1;
			if (da > db) return 1;
			return 0;
		});

		return planets;
	}

	var calcDistanseViaPoints = function(points) {
		distance = 0;

		if (points && points.length > 1) {
			for (var i = 0; i < points.length - 1; i++) {
				distance += calcDistanse(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
			}
		}

		return distance;
	}

	var getConnectionPoints = function(startPoint, midPlanet, finishPoint) {
		var angle = Math.atan2(finishPoint.y - startPoint.y, finishPoint.x - startPoint.x);

		var topPoint = findNewPoint(startPoint, midPlanet, angle, true);
		var bottomPoint = findNewPoint(startPoint, midPlanet, angle, false);

		var startToTopIntersects = getIntersectedPlantents(startPoint, topPoint);
		var startToBottomIntersects = getIntersectedPlantents(startPoint, bottomPoint);

		if (!startToTopIntersects.length || !startToBottomIntersects.length) {
			if (startToTopIntersects.length == startToBottomIntersects.length) {

				var distToTop = calcDistanseViaPoints([startPoint, topPoint, finishPoint]);
				var distToBottom = calcDistanseViaPoints([startPoint, bottomPoint, finishPoint]);

				if (distToTop > distToBottom) {
					return bottomPoint;
				} else {
					return topPoint;
				}
			} else {
				return startToTopIntersects.length ? bottomPoint : topPoint;
			}
		} else {

			var topToFinishIntersects = getIntersectedPlantents(topPoint, finishPoint);
			var bottomToFinishIntersects = getIntersectedPlantents(bottomPoint, finishPoint);

			var topLength = startToTopIntersects.length + topToFinishIntersects.length;
			var bottomLength = startToBottomIntersects.length + bottomToFinishIntersects.length

			if (topLength > bottomLength) {
				midPlanet = startToBottomIntersects[0];
			} else if(topLength < bottomLength) {
				midPlanet = startToTopIntersects[0];
			} else {
				
				var distToTop = calcDistanseViaPoints([startPoint, topPoint, finishPoint]);
				var distToBottom = calcDistanseViaPoints([startPoint, bottomPoint, finishPoint]);

				if (distToTop > distToBottom) {
					midPlanet = startToBottomIntersects[0];
				} else {
					midPlanet = startToTopIntersects[0];
				}
			}

			return getConnectionPoints(startPoint, midPlanet, finishPoint);
		}
	}

	var getPath = function(startPoint, finishPoint) {
		var coords = [];
		coords.push(startPoint);

		var planets = getIntersectedPlantents(startPoint, finishPoint);

		while (planets.length) {

			var closestPlanet = planets[0];

			var point = getConnectionPoints(coords[coords.length - 1], closestPlanet, finishPoint);
			coords.push(point);

			planets = getIntersectedPlantents(point, finishPoint);
		}

		coords.push(finishPoint);
		return coords;
	}

	this.polyline = null;
	this.lineOptions = null;
	this.totalDistance = null;

	this.constructor = function(map, startPoint, endPoint, color) {

		var points = getPath(startPoint, endPoint);
		points = buildSpline(points);

		this.polyline = new L.Polyline([], {
			color: color,
			weight: 3,
			smoothFactor: 1
		}).addTo(map);

		for (var i = 0; i < points.length; i++) {
			this.polyline.addLatLng(L.latLng(points[i].x, points[i].y));
		}

		this.lineOptions = {
			"type": "Feature",
			"properties": {},
			"geometry": {
				"type": "LineString",
				"coordinates": _.map(points, function(point) {
				return [point.x, point.y];
				})
			}
		};

		this.totalDistance = turf.lineDistance(this.lineOptions, 'kilometers');
	}

	this.getPointAlongDistanceByCoef = function(k) {

		if (k > 1) {
			k = 1;
		} else if (k < 0) {
			k = 0;
		}

		var along = turf.along(this.lineOptions, this.totalDistance * k, 'kilometers');

		return {
			x: along.geometry.coordinates[0],
			y: along.geometry.coordinates[1]
		};
	}

	this.remove = function() {
		if (this.polyline) {
			map.removeLayer(this.polyline);
		}
	}

	this.constructor(map, startPoint, endPoint, color);
}

// ----------------------------------------------------------------------------
// MAIN
// ----------------------------------------------------------------------------

IS_DRAW_CURVED = true;

var mapView = null;
var planetViews = null;
var shipViews = null;

var createPlanet = function(planet) {
	if (!planetViews) planetViews = {};
	planetViews[ planet._id ] = new PlanetView(mapView, planet);
	planetViews[ planet._id ].update();
}

var updatePlanet = function(id) {
	if (planetViews && planetViews[ id ]) {
		planetViews[ id ].update();
	}
}

Game.Planets.getAll().observeChanges({
	added: function(id, planet) {
		planet._id = id;
		if (mapView) {
			createPlanet(planet);
		}
	},

	changed: function(id, planet) {
		if (mapView) {
			updatePlanet(id);
		}
	}
});

var createSpaceEvent = function(event) {
	switch (event.type) {
		case Game.SpaceEvents.EVENT_SHIP:
			if (!shipViews) shipViews = {};
			shipViews[ event._id ] = new ShipView(mapView, event);
			break;
	}
}

var updateSpaceEvent = function(id) {
	// TODO: implement!
}

var removeSpaceEvent = function(id) {
	if (shipViews && shipViews[ id ]) {
		shipViews[ id ].remove();
		shipViews[ id ] = null;
	}
}

Game.SpaceEvents.getAll().observeChanges({
	added: function(id, event) {
		event._id = id;
		if (mapView) {
			createSpaceEvent(event);
		}
	},

	changed: function(id, event) {
		if (mapView) {
			updateSpaceEvent(id);
		}
	},

	removed: function(id) {
		if (mapView) {
			removeSpaceEvent(id);
		}
	}
});

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
		zoom: 8,
		minZoom: 2, //3
		maxZoom: 10
	});

	mapView.on('click', function(e) {
		Session.set('planet', null);
	});

	shipViews = {};
	Meteor.call('spaceEvents.updateAll');

	// Init planets
	planetViews = {};
	var planets = Game.Planets.getAll().fetch();

	if (planets.length == 0) {
		// create first planets
		// TODO: show home planet after initialize!
		Meteor.call('planet.initialize');
	} else {
		// show existing
		planets.forEach(function(item, i, arr) {
			createPlanet(item);
		});
	}

	// Init events
	var events = Game.SpaceEvents.getAll().fetch();
	events.forEach(function(item, i, arr) {
		createSpaceEvent(item);
	});

	// TODO: move to actualize info method!
	setInterval(function() {
		Meteor.call('planet.updateAll');
	}, 1000);
});

Template.cosmos.onDestroyed(function() {
	if (mapView) {
		// TODO: Возможно нужно удалять карту или удалять слушателей событий
	}
});

Template.cosmos.helpers({
	planet: function() { return Session.get('planet'); },
	drop: function() { return Session.get('drop'); }
});

Template.cosmos.events({
	'click .map-control-home': function(e) {
		if (mapView) {

			var homePlanet = Game.Planets.getBase();
			if (homePlanet) {
				mapView.setView([homePlanet.x, homePlanet.y], 8);
			} else {
				mapView.setView([0, 0], 8);
			}
		}
	},

	'click .button-attack': function(e) {
		// TODO: Рефакторинг!!! data-target-id data-target-type
		var eventId = $(e.currentTarget).attr("data-event-id");
		if (eventId && eventId.length > 0) {

			var targetShip = shipViews[ eventId ];
			var targetPoint = targetShip.getAttackPoint();

			Meteor.call('spaceEvents.attackReptFleet', eventId, targetPoint.x, targetPoint.y);
		} else {

			var planetId = $(e.currentTarget).attr("data-planet-id");
			if (planetId && planetId.length > 0) {
				Meteor.call('planet.sendFleet', planetId);
			}
		}
	}
});

// ------------------------------------------------------
// Debug methods
// ------------------------------------------------------

Game.Planets.debugDrawGalactic = function(hands, segments, rotation, narrow, min, max, radius, angle) {
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
		strDebug += Game.Planets.calcFlyTimeByDistance(1, maxSpeed, acceleration) + ' - ';
		strDebug += Game.Planets.calcFlyTimeByDistance(2, maxSpeed, acceleration) + ' - ';
		strDebug += Game.Planets.calcFlyTimeByDistance(20, maxSpeed, acceleration) + ' - ';
		strDebug += Game.Planets.calcFlyTimeByDistance(40, maxSpeed, acceleration) + ' - ';
		strDebug += Game.Planets.calcFlyTimeByDistance(80, maxSpeed, acceleration);

		if (i % 10 == 0) {
			console.log('================================================');
		}
		console.log(strDebug);
	}
}

}