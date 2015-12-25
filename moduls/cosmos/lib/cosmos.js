initCosmosLib = function() {

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

	getType: function(id) {
		for (var i = 0; i < Game.Planets.types.length; i++) {
			if (Game.Planets.types[i].engName == id) {
				return Game.Planets.types[i];
			}
		}
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

	calcFlyDistanceByTime: function(currentTime, totalDistance, maxSpeed, acceleration) {

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

	calcFlyTimeByDistance: function(distance, maxSpeed, acceleration) {
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

	getHumansEngineLevel: function() {
		return 0;
	},

	getReptsEngineLevel: function() {
		return 0;
	},

	calcFlyTime: function(startPoint, endPoint, engineLevel) {
		
		engineLevel = 0; // TODO: шпиливили!!!!!!!!!!!!!!!!

		var distance = Math.sqrt( Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2) );
		var maxSpeed = Game.Planets.calcMaxSpeed(engineLevel);
		var acceleration = Game.Planets.calcAcceleration(engineLevel);

		return Game.Planets.calcFlyTimeByDistance(distance, maxSpeed, acceleration);
	},

	calcAttackFlyTime: function(pointBase, pointStart, pointEnd, timeStart, timeEnd, timeCurrent) {

		// TODO: шпиливили!!!!!!!!!!!!!!!!!!!!!!

		var k = 1 - (timeEnd - timeCurrent) / (timeEnd - timeStart);
		var angle = Math.atan2(pointEnd.y - pointStart.y, pointEnd.x - pointStart.x);
		var distance = Math.sqrt( Math.pow(pointEnd.x - pointStart.x, 2) + Math.pow(pointEnd.y - pointStart.y, 2) );

		var pointAttack = {
			x: pointStart.x + distance * Math.cos(angle) * k,
			y: pointStart.y + distance * Math.sin(angle) * k
		}

		return Game.Planets.calcFlyTime(pointBase, pointAttack);
	}
}

Game.SpaceEvents = {

	// event types
	EVENT_SHIP: 1,

	// event targets
	TARGET_SHIP: 1,
	TARGET_PLANET: 2,

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
	}
}

initCosmosContent();

}