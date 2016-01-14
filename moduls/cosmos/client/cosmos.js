initCosmosClient = function() {

initCosmosLib();
initCosmosPlanetView();
initCosmosShipView();
initCosmosPathView();

Meteor.subscribe('planets');
Meteor.subscribe('spaceEvents');

Game.Cosmos.showPage = function() {
	this.render('cosmos', {
		to: 'content',
		data: {
			drop: new ReactiveVar(null),
			planet: new ReactiveVar(null),
			ship: new ReactiveVar(null),
			target: new ReactiveVar(null),
			activeColonyId: new ReactiveVar(null),
			colonies: new ReactiveVar(null),
			mapView: null,
			planetViews: {},
			shipViews: {}
		}

	});
}

Template.cosmos.onRendered(function() {

	var template = this;
	var mapView = null;

	// observe planets
	var createPlanet = function(planet) {
		template.data.planetViews[ planet._id ] = new game.PlanetView(mapView, planet, template);
		template.data.planetViews[ planet._id ].update();

		if (planet.isHome) {
			mapView.setView([planet.x, planet.y], 8);
		}
	}

	var updatePlanet = function(id) {
		if (template.data.planetViews && template.data.planetViews[ id ]) {
			template.data.planetViews[ id ].update();
			// ----------------------------------------------------------------
			// Dirty workaround!
			// ----------------------------------------------------------------
			// Always update base planet, because everytime you gain or loose colony
			// gui property info.canSend might be changed.
			var baseId = Game.Planets.getBase()._id;
			if (baseId && baseId != id && template.data.planetViews[ baseId ]) {
				template.data.planetViews[ baseId ].update();
			}
			// ----------------------------------------------------------------
		}
	}

	Game.Planets.getAll().observeChanges({
		added: function(id, planet) {
			planet._id = id;
			if (mapView) {
				createPlanet(planet, template);
			}
		},

		changed: function(id, planet) {
			if (mapView) {
				updatePlanet(id);
			}
		}
	});

	// observe space events
	var createSpaceEvent = function(event) {
		if (event.status == Game.SpaceEvents.status.FINISHED
		 || event.timeEnd <= Session.get('serverTime')
		) {
			return;
		}

		switch (event.type) {
			case Game.SpaceEvents.type.SHIP:
				template.data.shipViews[ event._id ] = new game.ShipView(mapView, event, template);
				break;
		}
	}

	var updateSpaceEventData = function(id) {
		if (template.data.shipViews && template.data.shipViews[ id ]) {
			template.data.shipViews[ id ].updateData();
		}
	}

	var removeSpaceEvent = function(id) {
		if (template.data.shipViews && template.data.shipViews[ id ]) {
			template.data.shipViews[ id ].remove();
			template.data.shipViews[ id ].updateData();
			template.data.shipViews[ id ] = null;
		}
	}

	Game.SpaceEvents.getAll().observeChanges({
		added: function(id, event) {
			event._id = id;
			if (mapView) {
				createSpaceEvent(event, template);
			}
		},

		changed: function(id, event) {
			if (mapView) {
				if (event.status == Game.SpaceEvents.status.FINISHED) {
					removeSpaceEvent(id);
				} else {
					updateSpaceEventData(id);
				}
			}
		},

		removed: function(id) {
			if (mapView) {
				removeSpaceEvent(id);
			}
		}
	});

	// init map
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
		template.data.planet.set(null);
		template.data.ship.set(null);
	});

	template.data.mapView = mapView;

	// init planets
	var planets = Game.Planets.getAll().fetch();
	if (planets.length == 0) {
		// create first planets
		Meteor.call('planet.initialize');
	} else {
		// show existing
		for (var i = 0; i < planets.length; i++) {
			createPlanet(planets[i]);
		}
	}

	// init events
	var events = Game.SpaceEvents.getAll().fetch();
	for (var i = 0; i < events.length; i++) {
		createSpaceEvent(events[i], this);
	}

	// first update
	Meteor.call('spaceEvents.updateAll');
	Meteor.call('planet.updateAll');
});

Template.cosmos.onDestroyed(function() {
	// TODO: Maybe clear map or event listeners?!
});

Template.cosmos.helpers({
	planet: function() { return Template.instance().data.planet.get(); },
	ship: function() { return Template.instance().data.ship.get(); },
	drop: function() { return Template.instance().data.drop.get(); },
	target: function() { return Template.instance().data.target.get(); },
	activeColonyId: function() { return Template.instance().data.activeColonyId.get(); },
	colonies: function() { return Template.instance().data.colonies.get(); },

	timeAttack: function() {
		var target = Template.instance().data.target.get();
		if (!target) {
			return null;
		}

		var baseId = Template.instance().data.activeColonyId.get();
		var planet = Template.instance().data.planet.get();
		var ship = Template.instance().data.ship.get();
		
		if (planet) {
			var basePlanet = Game.Planets.getOne(baseId);
			var targetPlanet = Game.Planets.getOne(target);
			var engineLevel = Game.Planets.getEngineLevel();

			return Game.Planets.calcFlyTime(basePlanet, targetPlanet, engineLevel);
		}

		if (ship) {
			var basePlanet = Game.Planets.getOne(baseId);
			var targetShip = Game.SpaceEvents.getOne(target);
			var engineLevel = Game.Planets.getEngineLevel();
			var timeCurrent = Session.get('serverTime');

			var result = Game.Planets.calcAttackOptions(
				basePlanet,
				engineLevel,
				targetShip,
				timeCurrent
			);

			return (result) ? result.time : null;
		}

		return null;
	},

	timeLeft: function() {
		var target = Template.instance().data.target.get();
		if (!target) {
			return null;
		}

		var ship = Template.instance().data.ship.get();
		if (ship) {
			var targetShip = Game.SpaceEvents.getOne(target);
			var timeCurrent = Session.get('serverTime');
			return targetShip.timeEnd - timeCurrent;
		}

		return null;
	},

	timeFly: function() {
		var ship = Template.instance().data.ship.get();
		if (ship) {
			var targetShip = Game.SpaceEvents.getOne(ship.id);
			var timeCurrent = Session.get('serverTime');
			return targetShip.timeEnd - timeCurrent;
		}

		return null;
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
	},

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

Template.cosmos.events({
	'click .map-fleet': function(e, t) {
		$(e.currentTarget).data('view').showSideInfo();
	},

	'click .map-planet-marker': function(e, t) {
		$(e.currentTarget).data('view').showSideBarInfo();
	},

	'mouseover .map-planet-marker': function(e, t) {
		$(e.currentTarget).data('view').showPopup();
	},

	'mouseout .map-planet-marker': function(e, t) {
		$(e.currentTarget).data('view').hidePopup();
	},

	'click .map-control-home': function(e, t) {
		if (t.data.mapView) {
			var homePlanet = Game.Planets.getBase();
			if (homePlanet) {
				t.data.mapView.setView([homePlanet.x, homePlanet.y], 8);
			} else {
				t.data.mapView.setView([0, 0], 8);
			}
		}
	},

	'click .fleet': function (e, t) {
		var id = $(e.currentTarget).attr('data-id');
		if (!id) {
			return;
		}

		if (!t.data.shipViews || !t.data.mapView) {
			return;
		}

		var shipView = t.data.shipViews[ id ];
		if (!shipView) {
			return;
		}

		var position = shipView.getPosition();
		t.data.mapView.setView([position.x, position.y], 9);
	},

	'click .open': function(e, t) {
		if (!Game.SpaceEvents.checkCanSendFleet()) {
			Notifications.info('Слишком много флотов уже отправлено');
			return;
		}

		var targetId = $(e.currentTarget).attr("data-id");
		var planet = t.data.planet.get();
		var ship = t.data.ship.get();

		var colonies = Game.Planets.getColonies();

		// delete selected planet from colonies
		var isColonySelected = false;
		if (planet) {
			var n = colonies.length;
			while (n-- > 0) {
				if (colonies[n]._id == targetId) {
					colonies.splice(n, 1);
					isColonySelected = true;
					break;
				}
			}
		}

		// add free slots
		var maxCount = Game.Planets.getMaxColoniesCount();
		var sentCount = Game.SpaceEvents.getSentToColonyCount();

		if (isColonySelected) {
			maxCount -= 1;
		}

		for (var i = colonies.length; i < maxCount; i++) {
			colonies.push({
				isEmpty: true,
				isSent: (sentCount > 0 ? true : false)
			});
			sentCount--;
		}

		if (colonies.length > 0) {
			t.data.activeColonyId.set( colonies[0]._id );
			t.data.colonies.set( colonies );
			t.data.target.set( targetId );
		}
	},

	'click .btn-close': function(e, t) {
		t.data.target.set( null );
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
			var max = parseInt( $(element).find('.max').html() );
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

		var target = t.data.target.get();
		var planet = t.data.planet.get();
		var ship = t.data.ship.get();

		if (!target) {
			Notifications.info('Не выбрана цель');
			return;
		}

		if (planet) {
			// Send to planet
			Meteor.call('planet.sendFleet', basePlanet._id, target, units, isOneway);

		} else if (ship) {
			// Attack ship
			var engineLevel = Game.Planets.getEngineLevel();
			var targetShip = t.data.shipViews[ target ];
			var attack = targetShip.getAttackPointAndTime(basePlanet, engineLevel);

			if (!attack) {
				Notifications.info('Невозможно перехватить вражеский флот');
				return;
			}

			Meteor.call(
				'spaceEvents.attackReptFleet',
				basePlanet._id,
				target,
				units,
				attack.point.x, 
				attack.point.y
			);
		}

		t.data.target.set(null);
		t.data.planet.set(null);
		t.data.ship.set(null);

		Notifications.success('Флот отправлен');
	}
});

// ------------------------------------------------------
// Debug methods
// ------------------------------------------------------

var debugMap = null;

Game.Planets.debugDrawGalactic = function(hands, segments, rotation, narrow, min, max, radius, angle) {
	if (!debugMap) {
		// init debug map
		// TODO: fix this leaflet shit!
		//       Map container is already initialized
		debugMap = L.map('map-battle', {
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
	} else {
		// clear debug map
		debugMap.eachLayer(function (layer) {
			debugMap.removeLayer(layer);
		});
	}

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
			}).addTo(debugMap);
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