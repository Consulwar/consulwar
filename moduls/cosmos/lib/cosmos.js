initCosmosLib = function() {
'use strict';

game.PlanetType = function(options) {
	if (Game.Planets.types[options.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется тип планеты ' + options.engName);
	}
	Game.Planets.types[options.engName] = options;
};

Game.Cosmos = {};

Game.Planets = {

	Collection: new Meteor.Collection('planets'),

	RENAME_PLANET_PRICE: 200,
	MAX_EXTRA_COLONIES: 10,

	getExtraColoniesCount: function() {
		var basePlanet = Game.Planets.getBase();
		return (basePlanet && basePlanet.extraColoniesCount)
			? basePlanet.extraColoniesCount
			: 0;
	},

	getExtraColonyPrice: function(count) {
		return [
			500,  // 1
			1110, // 2
			1830, // 3
			2660, // 4
			3600, // 5
			4650, // 6
			5810, // 7
			7080, // 8
			8460, // 9
			9950  // 10
		][count || Game.Planets.getExtraColoniesCount()];
	},

	getAll: function() {
		return Game.Planets.Collection.find({
			user_id: Meteor.userId()
		});
	},

	getByArtefact: function(artefact) {
		var condition = {
			user_id: Meteor.userId()
		};
		condition['artefacts.' + artefact] = { $gt: 0 };
		return Game.Planets.Collection.find(condition).fetch();
	},

	getOne: function(id) {
		return Game.Planets.Collection.findOne({
			user_id: Meteor.userId(),
			_id: id
		});
	},

	getBase: function() {
		return Game.Planets.Collection.findOne({
			user_id: Meteor.userId(),
			isHome: true
		});
	},

	getColonies: function() {
		return Game.Planets.Collection.find({
			user_id: Meteor.userId(),
			$or: [
				{ isHome: true },
				{ armyId: { $ne: null } }
			]
		}).fetch();
	},

	getMaxColoniesCount: function() {
		return 3 + Game.User.getLevel() + Game.Planets.getExtraColoniesCount();
	},

	getColoniesCount: function() {
		return Game.Planets.getColonies().length;
	},

	checkCanHaveMoreColonies: function(baseId, isLeavingBase, targetId) {
		// count already targeted planets
		var targets = [];
		var isTargetInList = false;
		var fleets = Game.SpaceEvents.getFleets().fetch();
		var id = null;

		for (var i = 0; i < fleets.length; i++) {
			var fleet = fleets[i];

			if (!fleet.info.isHumans) {
				continue;
			}

			id = fleet.info.isOneway
				? fleet.info.targetId
				: fleet.info.startPlanetId;

			if (targets.indexOf(id) == -1) {
				targets.push(id);
			}

			// base is target of another fleet, so we can't leave base
			if (id == baseId) {
				isLeavingBase = false;
			}

			// target planet in list, so we can send more
			if (id == targetId) {
				isTargetInList = true;
			}
		}

		// add current colonies
		var colonies = Game.Planets.getColonies();
		for (var n = 0; n < colonies.length; n++) {
			id = colonies[n]._id;
			if (targets.indexOf(id) == -1) {
				targets.push(id);
			}
		}

		// finaly count and check
		var current = targets.length;

		if (isLeavingBase) {
			current--;
		}

		if (isTargetInList) {
			current--;
		}

		return (current < Game.Planets.getMaxColoniesCount()) ? true : false;
	},

	getFleetUnits: function(planetId) {
		var planet = Game.Planets.getOne(planetId);
		if (!planet) {
			return null;
		}

		if (planet.mission) {
			if (planet.mission.units) {
				return planet.mission.units;
			} else {
				return _.clone(Game.Battle.items[planet.mission.type].level[planet.mission.level].enemies);
			}
		} else if (planet.armyId || planet.isHome) {
			var army = (planet.isHome) 
				? Game.Unit.getHomeArmy()
				: Game.Unit.getArmy(planet.armyId);
			if (army && army.units && army.units.army) {
				return army.units.army.fleet;
			}
		}

		return null;
	},

	getDefenseUnits: function(planetId) {
		var planet = Game.Planets.getOne(planetId);
		if (!planet) {
			return null;
		}

		if (planet.armyId || planet.isHome) {
			var army = (planet.isHome) 
				? Game.Unit.getHomeArmy()
				: Game.Unit.getArmy(planet.armyId);
			if (army && army.units && army.units.army) {
				return army.units.army.defense;
			}
		}

		return null;
	},

	calcDistance: function(start, end) {
		return Math.sqrt( Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2) );
	},

	calcAngle: function(start, end) {
		return Math.atan2(end.y - start.y, end.x - start.x);
	},

	// ------------------------------------------------------------------------
	// Planets generation
	// ------------------------------------------------------------------------

	MIN_PLANET_DISTANCE: 1,

	types: {},

	calcSegmentCenter: function(hand, segment, maxHands, maxSegments, rotationFactor, maxRadius, galacticAngle) {
		// central sector
		if (segment === 0) {	
			return {
				x: 0,
				y: 0
			};
		}

		// hand segment
		var distance = maxRadius * (segment + 0.5) / maxSegments;
		var angle = galacticAngle + hand * (Math.PI * 2 / maxHands) + distance * rotationFactor;
		return {
			x: distance * Math.cos(angle),
			y: distance * Math.sin(angle)
		};
	},

	calcSegmentPlanetsAmount: function(hand, segment, maxHands, maxSegments, minPlanets, maxPlanets) {
		var kCenter = 0.1; // center = 10% of all planets
		var kHand = (1 - kCenter) / maxHands;

		var min = 0;
		var max = 0;

		if (segment === 0) {
			min = minPlanets * kCenter;
			max = maxPlanets * kCenter;
		} else {
			var k = (maxSegments + 1 - segment) / maxSegments;
			min = (minPlanets * kHand) / (maxSegments + 1) * 2 * k;
			max = (maxPlanets * kHand) / (maxSegments + 1) * 2 * k;
		}

		var amount = Game.Random.interval(min, max);
		return (amount >= 1) ? amount : 0;
	},

	calcSegmentRandomPoints: function(amount, hand, segment, maxHands, maxSegments, rotationFactor, narrowFactor, maxRadius, galacticAngle) {
		var result = [];
		var angle = 0;
		var distance = 0;

		// central sector
		if (segment <= 0) {
			var radius = maxRadius / maxSegments * 0.9;

			while (amount-- > 0) {
				distance = Game.Random.random() * radius;
				angle = Game.Random.random() * Math.PI * 2;

				result.push({
					x: distance * Math.cos(angle),
					y: distance * Math.sin(angle)
				});
			}

			return result;
		}

		// hand segment
		var handAngle = Math.PI * 2 / maxHands;
		var handAngleOffset = handAngle * 2;
		var startAngle = hand * handAngle + galacticAngle;

		var startDistance = maxRadius * segment / maxSegments;
		var endDistance = maxRadius * (segment + 1) / maxSegments;

		var delta = endDistance - startDistance;
		startDistance += delta * 0.2;
		endDistance -= delta * 0.2;

		while (amount-- > 0) {
			distance = startDistance + Game.Random.random() * (endDistance - startDistance);

			var rotation = distance * rotationFactor;

			var offset = Game.Random.random() * handAngleOffset - handAngleOffset / 2;
			offset = offset * (narrowFactor / distance);
			if (offset < 0) {
				offset = Math.pow(offset, 2) * -1;
			} else {
				offset = Math.pow(offset, 2);
			}
			
			if (Math.abs(offset) >= handAngle / 2) {
				offset = Game.Random.random() * (handAngle * 0.8) - (handAngle * 0.8) / 2;
			}

			angle = startAngle + offset + rotation;

			result.push({
				x: distance * Math.cos(angle),
				y: distance * Math.sin(angle)
			});
		}

		return result;
	},

	// ------------------------------------------------------------------------
	// Travel speed & time calculations
	// ------------------------------------------------------------------------
	
	_speedKCached: 0,
	_speedLevelCached: 0,

	calcSpeedK: function(level) {
		if (level != Game.Planets._speedLevelCached) {

			var config = Game.Cosmos.SPEED_CONFIG;
			var k = 0;

			if (level >= 100) {
				k = 100;
			} else if (level >= 1) {
				var i = Math.floor( level / 10 );
				var j = level % 10;
				k = config[i] + (config[i + 1] - config[i]) / 10 * j;
			}

			Game.Planets._speedLevelCached = level;
			Game.Planets._speedKCached = k / 100;
		}

		return Game.Planets._speedKCached;
	},

	calcMaxSpeed: function(level) {
		var min = Game.Cosmos.MIN_SPEED;
		var max = Game.Cosmos.MAX_SPEED;
		return min + (max - min) * Game.Planets.calcSpeedK(level);
	},

	calcAcceleration: function(level) {
		var min = Game.Cosmos.MIN_ACC;
		var max = Game.Cosmos.MAX_ACC;
		return min + (max - min) * Game.Planets.calcSpeedK(level);
	},

	getEngineLevel: function() {
		return Game.Research.get('evolution', 'hyperdrive');
	},

	calcDistanceByTime: function(currentTime, totalDistance, maxSpeed, acceleration) {
		totalDistance *= 50;

		var isFlying = true;
		var maxAccelerationDistance = totalDistance / 2;
		var speed = 0;
		var traveledDistance = 0;
		var time = 0;

		if (time >= currentTime) {
			isFlying = false;
		}

		while (isFlying && speed < maxSpeed && traveledDistance < maxAccelerationDistance) {
			speed = Math.min(speed + acceleration, maxSpeed);
			traveledDistance += speed;
			time++;

			if (time >= currentTime) {
				isFlying = false;
			}
		}

		var accDistance = traveledDistance;

		while (isFlying && speed !== 0 && traveledDistance < (totalDistance - accDistance)) {
			traveledDistance += speed;
			time++;

			if (time >= currentTime) {
				isFlying = false;
			}
		}

		while (isFlying && speed > 0 && traveledDistance < totalDistance) {
			speed = Math.max(speed - acceleration, acceleration);
			traveledDistance += speed;
			time++;

			if (time >= currentTime) {
				isFlying = false;
			}
		}

		return traveledDistance / 50;
	},

	calcTimeByDistance: function(currentDistance, totalDistance, maxSpeed, acceleration) {
		currentDistance *= 50;
		totalDistance *= 50;

		var isFlying = true;
		var maxAccelerationDistance = totalDistance / 2;
		var speed = 0;
		var traveledDistance = 0;
		var time = 0;

		if (traveledDistance >= currentDistance) {
			isFlying = false;
		}

		while (isFlying && speed < maxSpeed && traveledDistance < maxAccelerationDistance) {
			speed = Math.min(speed + acceleration, maxSpeed);
			traveledDistance += speed;
			time++;

			if (traveledDistance >= currentDistance) {
				isFlying = false;
			}
		}

		var accDistance = traveledDistance;

		while (isFlying && speed !== 0 && traveledDistance < (totalDistance - accDistance)) {
			traveledDistance += speed;
			time++;

			if (traveledDistance >= currentDistance) {
				isFlying = false;
			}
		}

		while (isFlying && speed > 0 && traveledDistance < totalDistance) {
			speed = Math.max(speed - acceleration, acceleration);
			traveledDistance += speed;
			time++;

			if (traveledDistance >= currentDistance) {
				isFlying = false;
			}
		}

		return time;
	},

	calcTotalTimeByDistance: function(distance, maxSpeed, acceleration) {
		distance *= 50;

		var maxAccelerationDistance = distance / 2;
		var speed = 0;
		var traveledDistance = 0;
		var time = 0;

		// TODO: Формула! Где формула?!
		while (speed <= maxSpeed && traveledDistance < maxAccelerationDistance) {
			speed = Math.min(speed + acceleration, maxSpeed);
			traveledDistance += speed;
			time++;
		}

		traveledDistance *= 2;
		time *= 2;

		while (speed !== 0 && traveledDistance < distance) {
			traveledDistance += maxSpeed;
			time++;
		}

		return time;
	},

	calcFlyTime: function(startPoint, endPoint, engineLevel) {
		var distance = Game.Planets.calcDistance(startPoint, endPoint);
		var maxSpeed = Game.Planets.calcMaxSpeed(engineLevel);
		var acceleration = Game.Planets.calcAcceleration(engineLevel);

		return Game.Planets.calcTotalTimeByDistance(distance, maxSpeed, acceleration);
	},

	calcAttackOptions: function(attackerPlanet, attackerEngineLevel, targetShip, timeCurrent) {
		var angle = Game.Planets.calcAngle(
			targetShip.info.startPosition,
			targetShip.info.targetPosition
		);
		var totalDistance = Game.Planets.calcDistance(
			targetShip.info.startPosition,
			targetShip.info.targetPosition
		);

		var startPoint = {
			x: targetShip.info.startPosition.x,
			y: targetShip.info.startPosition.y,
		};

		var targetShipTime = timeCurrent - targetShip.timeStart;
		var targetShipSpeed = Game.Planets.calcMaxSpeed(targetShip.info.engineLevel);
		var targetShipAcc = Game.Planets.calcAcceleration(targetShip.info.engineLevel);

		var targetDistance = Game.Planets.calcDistanceByTime(
			targetShipTime,
			totalDistance,
			targetShipSpeed,
			targetShipAcc
		);

		var check = function(distance) {
			// target time
			var timeToPoint = Game.Planets.calcTimeByDistance(
				distance,
				totalDistance,
				targetShipSpeed,
				targetShipAcc
			);
			
			var timeLeft = timeToPoint - targetShipTime;

			// attack time
			var attackPoint = {
				x: startPoint.x + distance * Math.cos(angle),
				y: startPoint.y + distance * Math.sin(angle)
			};

			var timeAttack = Game.Planets.calcFlyTime(attackerPlanet, attackPoint, attackerEngineLevel);

			// check
			if (timeAttack >= timeLeft) {
				return null;
			} else {
				return timeAttack;
			}
		};

		if (targetDistance >= totalDistance - 0.1) {
			return null;
		}

		if (!check(totalDistance - 0.1)) {
			return null;
		}

		var left = targetDistance;
		var right = totalDistance - 0.1;
		var resultDistance = totalDistance - 0.1;

		while (Math.abs(right - left) >= 0.05) {
			var cur = left + (right - left) / 2;
			var checkResult = check(cur);

			if (checkResult) {
				right = cur;
				resultDistance = cur;
			} else {
				left = cur;
			}
		}

		return {
			k: resultDistance / totalDistance,
			time: check(resultDistance)
		};
	}

};

Game.SpaceEvents = {

	// event status
	status: {
		STARTED: 1,
		FINISHED: 2
	},

	// event type
	type: {
		SHIP: 1,
		REINFORCEMENT: 2,
		TRIGGER_ATTACK: 3
	},

	// event target
	target: {
		SHIP: 1,
		PLANET: 2
	},

	Collection: new Meteor.Collection('spaceEvents'),

	getAll: function() {
		return Game.SpaceEvents.Collection.find({
			user_id: Meteor.userId()
		}, {
			sort: {
				timeEnd: 1
			}
		});
	},

	getOne: function(id) {
		return Game.SpaceEvents.Collection.findOne({
			user_id: Meteor.userId(),
			_id: id
		});
	},

	getFleets: function () {
		return Game.SpaceEvents.Collection.find({
			user_id: Meteor.userId(),
			type: Game.SpaceEvents.type.SHIP,
			status: Game.SpaceEvents.status.STARTED
		}, {
			sort: {
				timeEnd: 1
			}
		});
	},

	getReinforcements: function() {
		return Game.SpaceEvents.Collection.find({
			user_id: Meteor.userId(),
			type: Game.SpaceEvents.type.REINFORCEMENT,
			status: Game.SpaceEvents.status.STARTED
		}, {
			sort: {
				timeEnd: 1
			}
		});
	},

	getCurrentFleetsCount: function() {
		var inSpace = Game.SpaceEvents.Collection.find({
			user_id: Meteor.userId(),
			type: Game.SpaceEvents.type.SHIP,
			status: Game.SpaceEvents.status.STARTED,
			'info.isHumans': true
		}).count();

		var toEarth = Game.SpaceEvents.Collection.find({
			user_id: Meteor.userId(),
			type: Game.SpaceEvents.type.REINFORCEMENT,
			status: Game.SpaceEvents.status.STARTED
		}).count();

		return inSpace + toEarth;
	},
	
	getMaxFleetsCount: function() {
		return Game.Planets.getMaxColoniesCount() * 2;
	},

	checkCanSendFleet: function() {
		if (Game.SpaceEvents.getCurrentFleetsCount() < Game.SpaceEvents.getMaxFleetsCount()) {
			return true;
		}
		return false;
	},

	getFleetUnits: function(ship) {
		if (!ship || ship.type != Game.SpaceEvents.type.SHIP) {
			return null;
		}

		var info = ship.info;

		if (info.mission) {
			if (info.mission.units) {
				return info.mission.units;
			} else {
				return _.clone(Game.Battle.items[info.mission.type].level[info.mission.level].enemies);
			}
		} else if (info.armyId) {
			var army = Game.Unit.getArmy(info.armyId);
			if (army && army.units && army.units.army) {
				return army.units.army.fleet;
			}
		}

		return null;
	}
};

initCosmosConfigLib();
initCosmosContent();

};