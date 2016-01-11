initCosmosLib = function() {

var calcDistance = function(start, end) {
	return Math.sqrt( Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2) );
}

var calcAngle = function(start, end) {
	return Math.atan2(end.y - start.y, end.x - start.x);
}

game.PlanetType = function(options) {
	Game.Planets.types.push(options);
}

Game.Cosmos = {};

Game.Planets = {

	Collection: new Meteor.Collection('planets'),

	getAll: function() {
		return Game.Planets.Collection.find({
			user_id: Meteor.userId()
		});
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
		return 4; // TODO: Implement later!
	},

	getColoniesCount: function() {
		return Game.Planets.getColonies().length;
	},

	checkCanHaveMoreColonies: function() {
		var current = Game.SpaceEvents.getSentToColonyCount()
		            + Game.Planets.getColoniesCount();

		return (current < Game.Planets.getMaxColoniesCount()) ? true : false;
	},

	getType: function(id) {
		for (var i = 0; i < Game.Planets.types.length; i++) {
			if (Game.Planets.types[i].engName == id) {
				return Game.Planets.types[i];
			}
		}
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
				return Game.Battle.items[planet.mission.type].level[planet.mission.level].enemies;
			}
		} else if (planet.armyId || planet.isHome) {
			var army = (planet.isHome) ? Game.Unit.getHomeArmy()
			                           : Game.Unit.getArmy(planet.armyId);
			if (army) {
				return army.units.army.fleet;
			}
		}

		return null;
	},

	// ------------------------------------------------------------------------
	// Planets generation
	// ------------------------------------------------------------------------

	MIN_PLANET_DISTANCE: 1,

	types: [],

	calcSegmentCenter: function(hand, segment, maxHands, maxSegments, rotationFactor, maxRadius, galacticAngle) {
		// central sector
		if (segment == 0) {	
			return {
				x: 0,
				y: 0
			}
		}

		// hand segment
		var distance = maxRadius * (segment + 0.5) / maxSegments;
		var angle = galacticAngle + hand * (Math.PI * 2 / maxHands) + distance * rotationFactor;
		return {
			x: distance * Math.cos(angle),
			y: distance * Math.sin(angle)
		}
	},

	calcSegmentPlanetsAmount: function(hand, segment, maxHands, maxSegments, minPlanets, maxPlanets) {
		var kCenter = 0.1; // center = 10% of all planets
		var kHand = (1 - kCenter) / maxHands;

		var min = 0;
		var max = 0;

		if (segment == 0) {
			min = minPlanets * kCenter;
			max = maxPlanets * kCenter;
		} else {
			var k = (maxSegments + 1 - segment) / maxSegments;
			min = (minPlanets * kHand) / (maxSegments + 1) * 2 * k;
			max = (maxPlanets * kHand) / (maxSegments + 1) * 2 * k;
		}

		var amount = Math.round( min + Math.random() * (max - min) );
		return (amount >= 1) ? amount : 0;
	},

	calcSegmentRandomPoints: function(amount, hand, segment, maxHands, maxSegments, rotationFactor, narrowFactor, maxRadius, galacticAngle) {
		var result = [];

		// central sector
		if (segment <= 0) {
			var radius = maxRadius / maxSegments * 0.9;

			while (amount-- > 0) {
				var distance = Math.random() * radius;
				var angle = Math.random() * Math.PI * 2;

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
			var distance = startDistance + Math.random() * (endDistance - startDistance);

			var rotation = distance * rotationFactor;

			var offset = Math.random() * handAngleOffset - handAngleOffset / 2;
			offset = offset * (narrowFactor / distance);
			if (offset < 0) {
				offset = Math.pow(offset, 2) * -1;
			} else {
				offset = Math.pow(offset, 2);
			}
			
			if (Math.abs(offset) >= handAngle / 2) {
				offset = Math.random() * (handAngle * 0.8) - (handAngle * 0.8) / 2;
			}

			var angle = startAngle + offset + rotation;

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

	SPEED_CONFIG: [ 0, 0.5, 1.5, 3, 6, 12, 24, 35, 44, 54, 80, 100 ],
	SPEED_K_CACHED: 0,
	SPEED_LEVEL_CACHED: 0,
	MIN_SPEED: 3,
	MAX_SPEED: 80,
	MIN_ACC: 0.4,
	MAX_ACC: 2,

	calcSpeedK: function(level) {
		if (level != Game.Planets.SPEED_LEVEL_CACHED) {

			var config = Game.Planets.SPEED_CONFIG;
			var k = 0;

			if (level >= 100) {
				k = 100;
			} else if (level >= 1) {
				var i = Math.floor( level / 10 );
				var j = level % 10;
				k = config[i] + (config[i + 1] - config[i]) / 10 * j;
			}

			Game.Planets.SPEED_LEVEL_CACHED = level;
			Game.Planets.SPEED_K_CACHED = k / 100;
		}

		return Game.Planets.SPEED_K_CACHED;
	},

	calcMaxSpeed: function(level) {
		var min = Game.Planets.MIN_SPEED;
		var max = Game.Planets.MAX_SPEED;
		return min + (max - min) * Game.Planets.calcSpeedK(level);
	},

	calcAcceleration: function(level) {
		var min = Game.Planets.MIN_ACC;
		var max = Game.Planets.MAX_ACC;
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

		while (isFlying && speed != 0 && traveledDistance < (totalDistance - accDistance)) {
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

		while (isFlying && speed != 0 && traveledDistance < (totalDistance - accDistance)) {
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

		while (speed != 0 && traveledDistance < distance) {
			traveledDistance += maxSpeed;
			time++;
		}

		return time;
	},

	calcFlyTime: function(startPoint, endPoint, engineLevel) {
		var distance = calcDistance(startPoint, endPoint);
		var maxSpeed = Game.Planets.calcMaxSpeed(engineLevel);
		var acceleration = Game.Planets.calcAcceleration(engineLevel);

		return Game.Planets.calcTotalTimeByDistance(distance, maxSpeed, acceleration);
	},

	calcAttackOptions: function(attackerPlanet, attackerEngineLevel, targetShip, timeCurrent) {
		var angle = calcAngle( targetShip.info.startPosition, targetShip.info.targetPosition );
		var totalDistance = calcDistance( targetShip.info.startPosition, targetShip.info.targetPosition );

		var startPoint = {
			x: targetShip.info.startPosition.x,
			y: targetShip.info.startPosition.y,
		}

		var targetShipTime = timeCurrent - targetShip.timeStart;
		var targetShipSpeed = Game.Planets.calcMaxSpeed(targetShip.info.engineLevel);
		var targetShipAcc = Game.Planets.calcAcceleration(targetShip.info.engineLevel);

		var targetDistance = Game.Planets.calcDistanceByTime(targetShipTime,
		                                                     totalDistance,
		                                                     targetShipSpeed,
		                                                     targetShipAcc);

		var check = function(distance) {
			// target time
			var timeToPoint = Game.Planets.calcTimeByDistance(distance,
			                                                  totalDistance,
			                                                  targetShipSpeed,
			                                                  targetShipAcc);
			var timeLeft = timeToPoint - targetShipTime;

			// attack time
			var attackPoint = {
				x: startPoint.x + distance * Math.cos(angle),
				y: startPoint.y + distance * Math.sin(angle)
			}

			var timeAttack = Game.Planets.calcFlyTime(attackerPlanet, attackPoint, attackerEngineLevel);

			// check
			if (timeAttack >= timeLeft) {
				return null;
			} else {
				return timeAttack;
			}
		}

		if (targetDistance + 0.5 >= totalDistance - 0.5) {
			return null;
		}

		if (!check(totalDistance - 0.5)) {
			return null;
		}

		var left = targetDistance;
		var right = totalDistance - 0.5;
		var resultDistance = totalDistance - 0.5;

		while (Math.abs(right - left) >= 0.1) {

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
		}
	}

}

Game.SpaceEvents = {

	// event status
	status: {
		STARTED: 1,
		FINISHED: 2
	},

	// event type
	type: {
		SHIP: 1
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

	getSentToColonyCount: function() {
		return Game.SpaceEvents.Collection.find({
			user_id: Meteor.userId(),
			type: Game.SpaceEvents.type.SHIP,
			status: Game.SpaceEvents.status.STARTED,
			'info.isHumans': true,
			'info.isColony': true
		}).count();
	},

	getCurrentFleetsCount: function() {
		return Game.SpaceEvents.Collection.find({
			user_id: Meteor.userId(),
			type: Game.SpaceEvents.type.SHIP,
			status: Game.SpaceEvents.status.STARTED,
			'info.isHumans': true
		}).count();
	},
	
	getMaxFleetsCount: function() {
		var colonies = Game.Planets.getColonies();
		return colonies.length * 2;
	},

	checkCanSendFleet: function() {
		if (Game.SpaceEvents.getCurrentFleetsCount() < Game.SpaceEvents.getMaxFleetsCount()) {
			return true;
		}
		return false;
	},

	getFleetUnits: function(shipId) {
		var ship = Game.SpaceEvents.getOne(shipId);
		if (!ship || ship.type != Game.SpaceEvents.type.SHIP) {
			return null;
		}

		var info = ship.info;

		if (info.mission) {
			if (info.mission.units) {
				return info.mission.units;
			} else {
				return Game.Battle.items[info.mission.type].level[info.mission.level].enemies;
			}
		} else if (info.armyId) {
			var army = Game.Unit.getArmy(info.armyId);
			if (army) {
				return army.units.army.fleet;
			}
		}

		return null;
	}
}

initCosmosContent();

}