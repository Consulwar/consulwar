initCosmosPlanetsServer = function() {

Game.Planets.update = function(planet) {
	if (!planet._id || !planet.user_id) {
		return null;
	}

	var data = _.omit(planet, '_id');

	Game.Planets.Collection.update({
		_id: planet._id
	}, {
		$set: data
	});
	
	return data;
}

Game.Planets.add = function(planet) {
	planet.user_id = Meteor.userId();
	return Game.Planets.Collection.insert(planet);
}

Game.Planets.generateType = function() {
	var result = null;
	var types = Game.Planets.types;

	// select by chance
	if (types.length > 0) {

		var val = 0;

		for (var i = 0; i < types.length; i++) {
			val += types[i].chance;
		}

		var randomVal = Math.random() * val;
		val = 0;

		for (var i = 0; i < types.length; i++) {
			val += types[i].chance;
			if (randomVal <= val) {
				result = types[i];
				break;
			}
		}
	}

	return result;
}

Game.Planets.generateName = function() {
	var letters = [
		'A', 'B', 'C', 'D', 'E', 'F',
		'G', 'H', 'I', 'J', 'K', 'L',
		'M', 'N', 'O', 'P', 'Q', 'R',
		'S', 'T', 'U', 'V', 'W', 'X',
		'Y', 'Z', '0', '1', '2', '3', 
		'4', '5', '6', '7', '8', '9'
	];

	var home = Meteor.user().planetName;
	var result = home;

	while (home == result) {
		result = (
		  letters[Math.floor(Math.random()*36)]
		+ letters[Math.floor(Math.random()*36)]
		+ letters[Math.floor(Math.random()*36)]
		+ '-'
		+ letters[Math.floor(Math.random()*36)]
		+ letters[Math.floor(Math.random()*36)]
		+ letters[Math.floor(Math.random()*36)]);
	}

	return result;
}

Game.Planets.generateMission = function(planet) {

	// TODO: Переделать эту херь!
	var types = [];
	if (planet) {
		types = ['patrolfleet', 'defencefleet', 'battlefleet'];
	} else {
		types = ['tradefleet'];
	}

	return {
		level: Math.round( Math.random() * 9 + 1 ),
		type: types[ Math.round( Math.random() * (types.length - 1) ) ]
	};
}

var getServerTime = function() {
	return Math.floor( new Date().valueOf() / 1000 );
}

// ----------------------------------------------------------------------------
// Galactic generation
// ----------------------------------------------------------------------------

var radToDeg = function(rad) {
	return rad * 180 / Math.PI;
}

var calcDistanse = function(ax, ay, bx, by) {
	return Math.sqrt( Math.pow(bx - ax, 2) + Math.pow(by - ay, 2) );
}

var hitCircleVsCircle = function(x1, y1, r1, x2, y2, r2) {
	var distance = Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) );
	return (r1 + r2 > distance) ? true : false;
}

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
}

Game.Planets.checkIntersects = function(planet, nearPlanets) {
	for (var i = 0; i < nearPlanets.length; i++) {
		var radius = Game.Planets.MIN_PLANET_DISTANCE / 2;
		if (hitCircleVsCircle(planet.x,
		                      planet.y,
		                      radius,
		                      nearPlanets[i].x,
		                      nearPlanets[i].y,
		                      radius)
		) {
			return true;
		}
	}
	return false;
}

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
}

Game.Planets.checkSectorDiscovered = function(hand, segment) {
	var planets = Game.Planets.getAll().fetch();
	for (var i = 0; i < planets.length; i++) {
		if (planets[i].hand == hand
		 && planets[i].segment == segment
		) {
			return true;
		}
	}
	return false;
}

Game.Planets.generateSector = function(galactic, hand, segment, isSkipDiscovered) {
	// check galactic bounds
	if (segment > galactic.segments || segment < 0) return;
	if (hand >= galactic.hands || hand < 0) return;

	// check sector already discovered
	if (isSkipDiscovered
	 && Game.Planets.checkSectorDiscovered(hand, segment)
	) {
		return;
	}

	// find near planets
	var nearPlanets = [];
	var planets = Game.Planets.getAll().fetch();

	for (var i = 0; i < planets.length; i++) {
		if (planets[i].segment == segment
		 || planets[i].segment == segment - 1
		 || planets[i].segment == segment + 1
		) {
			nearPlanets.push(planets[i]);
		}
	}

	// calc amount
	var amount = Game.Planets.calcSegmentPlanetsAmount(hand,
	                                                   segment,
	                                                   galactic.hands,
	                                                   galactic.segments,
	                                                   galactic.minPlanets,
	                                                   galactic.maxPlanets);

	// find random points
	var randSpots = Game.Planets.calcSegmentRandomPoints(amount,
	                                                     hand,
	                                                     segment,
	                                                     galactic.hands,
	                                                     galactic.segments,
	                                                     galactic.rotationFactor,
	                                                     galactic.narrowFactor,
	                                                     galactic.radius,
	                                                     galactic.angle);

	// fins free points
	var freeSpots = [];

	for (var i = 0; i < randSpots.length; i++) {
		if (!Game.Planets.checkIntersects(randSpots[i], nearPlanets)) {
			freeSpots.push(randSpots[i]);
			nearPlanets.push(randSpots[i]);
		}
	}

	// add new planets
	while (freeSpots.length > 0) {

		var n = Math.floor( Math.random() * freeSpots.length );

		var type = Game.Planets.generateType();
		var size = type.sizeMin + Math.round( Math.random() * ( type.sizeMax - type.sizeMin ) );
		if (size < 1) {
			size = 1;
		}

		var newPlanet = {
			name: Game.Planets.generateName(),
			isDiscovered: false,
			isHome: false,
			type: type.engName,
			// state
			mission: null,
			timeRespawn: 0,
			// generation
			segment: segment,
			hand: (segment > 0 ? hand : 0),
			// appearance
			x: freeSpots[n].x,
			y: freeSpots[n].y,
			size: size
		}

		var newId = Game.Planets.add(newPlanet);
		Meteor.call('planet.update', newId);

		freeSpots.splice(n, 1);
	}
}

// ----------------------------------------------------------------------------
// Public methods
// ----------------------------------------------------------------------------

Meteor.methods({

	'planet.initialize': function() {
		user = Meteor.user();
		var planets = Game.Planets.getAll().fetch();

		if (planets.length == 0) {

			var galactic = {
				radius: 40,
				hands: 4 + Math.round( Math.random() * 2 ), // 4 - 6
				segments: 10,
				rotationFactor: Math.round( 2 + Math.random() * 4 ) / 100, // 0.02 - 0.06
				narrowFactor: 5,
				angle: Math.random() * Math.PI * 2, // 0 - 360
				minPlanets: 400,
				maxPlanets: 500
			}

			var hand = Math.round( Math.random() * galactic.hands );
			var segment = galactic.segments - 3;
			var center = Game.Planets.calcSegmentCenter(hand,
			                                            segment,
			                                            galactic.hands,
			                                            galactic.segments,
			                                            galactic.rotationFactor,
			                                            galactic.radius,
			                                            galactic.angle);

			var planetId = Game.Planets.add({
				name: user.planetName,
				isDiscovered: false,
				isHome: true,
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
			});

			// open near sectors at start
			Game.Planets.generateSector(galactic, hand, segment, false);
			Game.Planets.generateSector(galactic, hand, segment + 1, false);
			Game.Planets.generateSector(galactic, hand, segment - 1, false);
		}
	},

	'planet.discover': function(planetId) {
		// get discovered planet
		var planet = Game.Planets.getOne(planetId);
		if (planet.isDiscovered) {
			return;
		}

		planet.isDiscovered = true;
		Game.Planets.update(planet);

		// get base planet
		var basePlanet = Game.Planets.getBase();
		if (!basePlanet) {
			return;
		}

		// find sectors to discover
		var sectors = Game.Planets.getSectorsToDiscover(basePlanet.galactic, planet.hand, planet.segment);

		// discover
		for (var i = 0; i < sectors.length; i++) {
			Game.Planets.generateSector(basePlanet.galactic, sectors[i].hand, sectors[i].segment, true);
		}
	},

	'planet.sendFleet': function(planetId) {
		var targetPlanet = Game.Planets.getOne(planetId);
		if (!targetPlanet) {
			return;
		}

		var basePlanet = Game.Planets.getBase();
		if (!basePlanet) {
			return;
		}

		if (basePlanet._id == targetPlanet._id) {
			return;
		}

		var startPosition = {
			x: basePlanet.x,
			y: basePlanet.y
		}

		var targetPosition = {
			x: targetPlanet.x,
			y: targetPlanet.y
		}

		Game.SpaceEvents.sendShip(startPosition,
		                          basePlanet._id,
		                          targetPosition,
		                          Game.SpaceEvents.TARGET_PLANET,
		                          targetPlanet._id,
		                          getServerTime(),
		                          Game.Planets.calcFlyTime(startPosition, targetPosition),
		                          true,
		                          null);
	},

	'planet.updateAll': function() {
		var planets = Game.Planets.getAll().fetch();
		if (planets) {
			for (var i = 0; i < planets.length; i++) {
				Meteor.call('planet.update', planets[i]._id);
			}
		}
	},

	'planet.update': function(planetId) {
		var planet = Game.Planets.getOne(planetId);
		if (!planet || planet.isHome) {
			return;
		}

		// spawn enemies
		var timeCurrent = getServerTime();
		if (!planet.mission && planet.timeRespawn <= timeCurrent) {
			if (Math.random() >= 0.5) {
				// create mission
				planet.mission = Game.Planets.generateMission(planet);
			} else {
				// wait
				planet.timeRespawn = timeCurrent + 1200;
			}
			Game.Planets.update(planet);
		}
	}

})

Meteor.publish('planets', function () {
	if (this.userId) {
		return Game.Planets.Collection.find({
			user_id: this.userId
		})
	}
});

}