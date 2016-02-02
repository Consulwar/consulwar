initCosmosPlanetsServer = function() {

Game.Planets.actualize = function() {
	Meteor.call('planet.updateAll');
}

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

Game.Planets.generateArtefacts = function(galactic, hand, segment, type) {
	// get artefacts spread config by distance from home planet or center
	var basePlanet = Game.Planets.getBase();
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
	var index = Math.round( distCurrent / distTotal * (len - 1) );
	var groups = Game.Cosmos.ARTEFACTS_GROUP_SPREAD[ index ];

	// select available items
	var planetItems = Game.Cosmos.PLANET_TYPE_ARTEFACTS[ type.engName ];
	var items = [];

	for (var groupName in groups) {
		if (!planetItems || !planetItems[groupName]) {
			continue;
		}

		var spawnChance = groups[groupName].chance;
		var dropPower = groups[groupName].power;

		for (var itemName in planetItems[groupName]) {
			items.push({
				name: itemName,
				spawnChance: spawnChance,
				dropChance: Math.round( planetItems[groupName][itemName] * dropPower )
			});
		}
	}

	if (items.length <= 0) {
		return null;
	}

	// select random items from available
	var result = {};
	var foundCount = 0;

	while (items.length > 0 && foundCount < 3) {

		var val = 0;
		for (var i = 0; i < items.length; i++) {
			val += items[i].spawnChance;
		}

		var randomVal = Game.Random.random() * val;
		val = 0;

		for (var i = 0; i < items.length; i++) {
			val += items[i].spawnChance;
			if (randomVal <= val) {
				break;
			}
		}

		result[items[i].name] = items[i].dropChance;
		foundCount++;

		items.splice(i, 1);
	}

	return result;
}

Game.Planets.collectArtefacts = function(planet) {
	if (!planet || !planet.artefacts) {
		return;
	}

	for (var key in planet.artefacts) {
		if (Game.Random.interval(1, 99) <= planet.artefacts[key]) {
			Game.Artefacts.add(key, 1);
		}
	}
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

		var randomVal = Game.Random.random() * val;
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
		  letters[Game.Random.interval(0, 35)]
		+ letters[Game.Random.interval(0, 35)]
		+ letters[Game.Random.interval(0, 35)]
		+ '-'
		+ letters[Game.Random.interval(0, 35)]
		+ letters[Game.Random.interval(0, 35)]
		+ letters[Game.Random.interval(0, 35)]);
	}

	return result;
}

Game.Planets.getLastAttackTime = function() {
	var home = Game.Planets.getBase();
	if (home && home.timeLastAttack) {
		return home.timeLastAttack;
	}
	return 0;
}

Game.Planets.setLastAttackTime = function(time) {
	var home = Game.Planets.getBase();
	if (home) {
		home.timeLastAttack = time;
		Game.Planets.update(home);
	}
}

Game.Planets.generateMission = function(planet) {
	// check planets
	if (!planet) {
		return;
	}

	var basePlanet = Game.Planets.getBase();
	if (!basePlanet) {
		return;
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
}

Game.Planets.getReptileAttackChance = function() {
	var power = Game.User.getVotePower();
	return {
		home: power * 5,
		colony: power * 1
	};
}

Game.Planets.getReptileAttackMission = function() {
	var power = Game.User.getVotePower();
	// missions config
	var missions = Game.Cosmos.ATTACK_MISSIONS;

	// select mission
	if (power >= missions.length) {
		power = missions.length - 1;
	}

	var list = missions[ power ];
	if (!list || list.length <= 0) {
		return;
	}

	var mission = list[ Game.Random.interval(0, list.length - 1) ];
	return {
		type: mission.type,
		level: mission.levels[ Game.Random.interval(0, mission.levels.length - 1) ]
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
	var amount = Game.Planets.calcSegmentPlanetsAmount(
		hand,
		segment,
		galactic.hands,
		galactic.segments,
		galactic.minPlanets,
		galactic.maxPlanets
	);

	// find random points
	var randSpots = Game.Planets.calcSegmentRandomPoints(
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

	for (var i = 0; i < randSpots.length; i++) {
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
			type
		)

		var newPlanet = {
			name: Game.Planets.generateName(),
			type: type.engName,
			artefacts: artefacts,
			// state
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
				hands: Game.Random.interval(4, 6),
				segments: 10,
				rotationFactor: Game.Random.interval(2, 6) / 100, // 0.02 - 0.06
				narrowFactor: 5,
				angle: Game.Random.random() * Math.PI * 2, // 0 - 360
				minPlanets: 400,
				maxPlanets: 500
			}

			var hand = Game.Random.interval(0, galactic.hands - 1);
			var segment = galactic.segments - 3;
			var center = Game.Planets.calcSegmentCenter(
				hand,
				segment,
				galactic.hands,
				galactic.segments,
				galactic.rotationFactor,
				galactic.radius,
				galactic.angle
			);

			var planetId = Game.Planets.add({
				name: user.planetName,
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

	'planet.sendFleet': function(baseId, targetId, units, isOneway) {
		if (!Game.SpaceEvents.checkCanSendFleet()) {
			throw new Meteor.Error('Слишком много флотов уже отправлено');
		}

		if (baseId == targetId) {
			return;
		}

		var targetPlanet = Game.Planets.getOne(targetId);
		if (!targetPlanet) {
			return;
		}

		var basePlanet = Game.Planets.getOne(baseId);
		if (!basePlanet) {
			return;
		}

		// check is new colony
		var isColony = false;
		if (isOneway && !targetPlanet.armyId && !targetPlanet.isHome) {
			isColony = true;
		}

		if (isColony && !Game.Planets.checkCanHaveMoreColonies()) {
			throw new Meteor.Error('Уже слишком много колоний');
		}

		// slice units
		var sourceArmyId = basePlanet.armyId;
		if (basePlanet.isHome) {
			sourceArmyId = Game.Unit.getHomeArmy()._id;
		}

		var destUnits = { army: { fleet: units } };
		var newArmyId = Game.Unit.sliceArmy(sourceArmyId, destUnits, Game.Unit.location.SHIP);

		// update base planet
		var baseArmy = Game.Unit.getArmy(basePlanet.armyId);
		if (!baseArmy) {
			basePlanet.armyId = null;	
		}
		basePlanet.timeRespawn = getServerTime() + Game.Cosmos.TIME_RESPAWN_MISSION;
		Game.Planets.update(basePlanet);

		var startPosition = {
			x: basePlanet.x,
			y: basePlanet.y
		}

		var targetPosition = {
			x: targetPlanet.x,
			y: targetPlanet.y
		}

		var engineLevel = Game.Planets.getEngineLevel();

		var shipOptions = {
			startPosition:  startPosition,
			startPlanetId:  basePlanet._id,
			targetPosition: targetPosition,
			targetType:     Game.SpaceEvents.target.PLANET,
			targetId:       targetPlanet._id,
			startTime:      getServerTime(),
			flyTime:        Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
			engineLevel:    engineLevel,
			isHumans:       true,
			isColony:       isColony,
			isOneway:       isOneway,
			mission:        null,
			armyId:         newArmyId,
		}

		Game.SpaceEvents.sendShip(shipOptions);
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
		if (!planet.mission
		 && !planet.armyId
		 &&  planet.timeRespawn <= timeCurrent
		) {
			if (Game.Random.random() >= 0.5) {
				// create mission
				planet.mission = Game.Planets.generateMission(planet);
			} else {
				// wait
				planet.timeRespawn = timeCurrent + Game.Cosmos.TIME_RESPAWN_MISSION;
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