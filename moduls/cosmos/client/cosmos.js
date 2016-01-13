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
			userFleets: new ReactiveVar(null),
			reptileFleets: new ReactiveVar(null),
			activeColonyId: new ReactiveVar(null),
			colonies: new ReactiveVar(null),
			timeAttack: new ReactiveVar(null),
			timeLeft: new ReactiveVar(null),
			timeFly: new ReactiveVar(null),
			planetViews: {},
			shipViews: {}
		}

	});
}

var template = null;
var mapView = null;

var createPlanet = function(planet, template) {
	template.data.planetViews[ planet._id ] = new game.PlanetView(mapView, planet, template);
	template.data.planetViews[ planet._id ].update();

	if (planet.isHome) {
		mapView.setView([planet.x, planet.y], 8);
	}
}

var updatePlanet = function(id) {
	if (template.data.planetViews && template.data.planetViews[ id ]) {
		template.data.planetViews[ id ].update();
	}
}

var refreshFleetsInfo = function() {
	var user = null;
	var reptile = null;

	var fleets = Game.SpaceEvents.getFleets().fetch();
	for (var i = 0; i < fleets.length; i++) {

		var startPlanetId = fleets[i].info.startPlanetId; 
		var startPlanet = null;
		if (startPlanetId) {
			startPlanet = Game.Planets.getOne(startPlanetId);
		}

		var finishPlanetId = fleets[i].info.targetId
		var finishPlanet = null;
		if (fleets[i].info.targetType == Game.SpaceEvents.target.PLANET && finishPlanetId) {
			finishPlanet = Game.Planets.getOne(finishPlanetId);
		}

		var info = {
			id: fleets[i]._id,
			start: startPlanet,
			finish: finishPlanet
		}

		if (fleets[i].info.isHumans) {
			if (!user) {
				user = [];
			}
			user.push(info);
		} else {
			if (!reptile) {
				reptile = [];
			}
			reptile.push(info);
		}
	}

	template.data.userFleets.set( user );
	template.data.reptileFleets.set( reptile );
}

var createSpaceEvent = function(event, template) {
	if (event.status == Game.SpaceEvents.status.FINISHED
	 || event.timeEnd <= Session.get('serverTime')
	) {
		return;
	}

	switch (event.type) {
		case Game.SpaceEvents.type.SHIP:
			template.data.shipViews[ event._id ] = new game.ShipView(mapView, event, template);
			refreshFleetsInfo();
			break;
	}
}

var updateSpaceEventData = function(id) {
	if (template.data.shipViews && template.data.shipViews[ id ]) {
		template.data.shipViews[ id ].updateData();
		refreshFleetsInfo();
	}
}

var removeSpaceEvent = function(id) {
	if (template.data.shipViews && template.data.shipViews[ id ]) {
		template.data.shipViews[ id ].remove();
		template.data.shipViews[ id ].updateData();
		template.data.shipViews[ id ] = null;
		refreshFleetsInfo();
	}
}

var refreshTimeToTarget = function() {
	var target = template.data.target.get();
	var baseId = template.data.activeColonyId.get();
	var planet = template.data.planet.get();
	var ship = template.data.ship.get();

	if (!target) {

		template.data.timeAttack.set( null );
		template.data.timeLeft.set( null );

	} else if (planet) {

		var basePlanet = Game.Planets.getOne(baseId);
		var targetPlanet = Game.Planets.getOne(target);
		var engineLevel = Game.Planets.getEngineLevel();

		var timeAttack = Game.Planets.calcFlyTime(basePlanet, targetPlanet, engineLevel);

		template.data.timeAttack.set( timeAttack );
		template.data.timeLeft.set( null );

	} else if (ship) {

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

		var timeAttack = (result) ? result.time : null;
		var timeLeft = targetShip.timeEnd - timeCurrent;

		template.data.timeAttack.set( timeAttack );
		template.data.timeLeft.set( timeLeft );

		setTimeout(refreshTimeToTarget, 1000);
	}
}

var sendFleet = function(isOneway) {
	var baseId = template.data.activeColonyId.get();
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

	var target = template.data.target.get();
	var planet = template.data.planet.get();
	var ship = template.data.ship.get();

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
		var targetShip = template.data.shipViews[ target ];
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

	template.data.target.set(null);
	template.data.planet.set(null);
	template.data.ship.set(null);

	Notifications.success('Флот отправлен');
}

Template.cosmos.onRendered(function() {

	// --------------------------------
	// TODO: refactoring!
	// --------------------------------
	template = this;
	// --------------------------------
	// TODO: refactoring!
	// --------------------------------

	// observe planets
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
		template.data.planet.set(null);
		template.data.ship.set(null);
	});

	// Init planets
	var planets = Game.Planets.getAll().fetch();

	if (planets.length == 0) {
		// create first planets
		Meteor.call('planet.initialize');
	} else {
		// show existing
		for (var i = 0; i < planets.length; i++) {
			createPlanet(planets[i], this);
		}
	}

	// Init events
	var events = Game.SpaceEvents.getAll().fetch();
	for (var i = 0; i < events.length; i++) {
		createSpaceEvent(events[i], this);
	}

	Meteor.call('spaceEvents.updateAll');
	Meteor.call('planet.updateAll');
});

Template.cosmos.onDestroyed(function() {
	if (mapView) {
		// TODO: Maybe clear map or event listeners?!
	}
});

Template.cosmos.helpers({
	planet: function() { return Template.instance().data.planet.get(); },
	ship: function() { return Template.instance().data.ship.get(); },
	drop: function() { return Template.instance().data.drop.get(); },
	target: function() { return Template.instance().data.target.get(); },

	userFleets: function () { return Template.instance().data.userFleets.get(); },
	reptileFleets: function () { return Template.instance().data.reptileFleets.get(); },

	activeColonyId: function() { return Template.instance().data.activeColonyId.get(); },
	colonies: function() { return Template.instance().data.colonies.get(); },

	timeAttack: function() { return Template.instance().data.timeAttack.get(); },
	timeLeft: function() { return Template.instance().data.timeLeft.get(); },
	timeFly: function () { return Template.instance().data.timeFly.get(); },

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

Template.cosmos.events({
	'click .map-control-home': function(e, t) {
		if (mapView) {
			var homePlanet = Game.Planets.getBase();
			if (homePlanet) {
				mapView.setView([homePlanet.x, homePlanet.y], 8);
			} else {
				mapView.setView([0, 0], 8);
			}
		}
	},

	'click .fleet': function (e, t) {
		var id = $(e.currentTarget).attr('data-id');
		if (!id) {
			return;
		}

		if (!shipViews || !mapView) {
			return;
		}

		var shipView = shipViews[ id ];
		if (!shipView) {
			return;
		}

		var position = shipView.getPosition();
		mapView.setView([position.x, position.y], 9);
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
			refreshTimeToTarget();
		}
	},

	'click .btn-close': function(e, t) {
		t.data.target.set( null );
	},

	'click .planets li': function(e, t) {
		var id = $(e.currentTarget).attr("data-id");
		if (id) {
			t.data.activeColonyId.set( id );
			refreshTimeToTarget();
		}
	},

	'click .btn-all': function(e, t) {
		$('.fleet li').each(function(index, element) {
			var max = Number( $(element).find('.max').html() );
			$(element).find('.count').val( max );
		});
	},

	'click .defend': function(e, t) {
		sendFleet(true);
	},

	'click .return': function(e, t) {
		sendFleet(false);
	},

	'change .fleet input': function (e, t) {
		var value = parseInt( e.currentTarget.value );
		var max = parseInt( $(e.currentTarget).attr('data-max') );

		if (value < 0) {
			e.currentTarget.value = 0;
		} else if (value > max) {
			e.currentTarget.value = max;
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