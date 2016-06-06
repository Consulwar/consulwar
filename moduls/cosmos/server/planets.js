initCosmosPlanetsServer = function() {

Game.Planets.Collection._ensureIndex({
	user_id: 1,
	isHome: 1
});

Game.Planets.actualize = function() {
	var planets = Game.Planets.getAll().fetch();
	if (!planets) {
		return;
	}

	var planet = null;
	var i = 0;

	// aggregate information about sectors
	var sectors = {};

	for (i = 0; i < planets.length; i++) {
		planet = planets[i];

		if (!sectors[planet.hand]) {
			sectors[planet.hand] = {};
		}
		if (!sectors[planet.hand][planet.segment]) {
			sectors[planet.hand][planet.segment] = {
				occupied: 0,
				total: 0
			};
		}

		if (planet.mission) {
			sectors[planet.hand][planet.segment].occupied += 1;
		}
		sectors[planet.hand][planet.segment].total += 1;
	}

	// update planets
	var timeCurrent = Game.getCurrentTime();

	for (i = 0; i < planets.length; i++) {
		planet = planets[i];

		// don't update home planet
		if (planet.isHome) {
			continue;
		}

		if (planet.armyId) {
			// auto collect artefacts
			if (planet.timeArtefacts) {
				var delta = timeCurrent - planet.timeArtefacts;
				var count = Math.floor( delta / Game.Cosmos.COLLECT_ARTEFACTS_PERIOD );
				if (count > 0) {
					var artefacts = Game.Planets.getArtefacts(planet, count);
					if (artefacts) {
						Game.Resources.add(artefacts);
					}
					planet.timeArtefacts += ( Game.Cosmos.COLLECT_ARTEFACTS_PERIOD * count );
					Game.Planets.update(planet);
				}
			}
		} else {
			// spawn enemies
			if (planet.timeRespawn <= timeCurrent) {
				if (!planet.mission) {
					// create new mission
					var sector = sectors[planet.hand][planet.segment];
					if (sector.occupied < 2
					 || sector.occupied < Math.floor(sector.total / 2)
					) {
						if (Game.Random.random() <= 0.5) {
							planet.mission = Game.Planets.generateMission(planet);
							sector.occupied += 1;
						}
					}
				} else if (planet.mission.units) {
					// restore previous
					planet.mission.units = null;
				}
				planet.timeRespawn = timeCurrent + Game.Cosmos.ENEMY_RESPAWN_PERIOD;
				Game.Planets.update(planet);
			}
		}
	}
};

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
};

Game.Planets.add = function(planet) {
	planet.user_id = Meteor.userId();
	return Game.Planets.Collection.insert(planet);
};

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
	var index = Math.floor( distCurrent / distTotal * (len - 1) );
	var groups = Game.Cosmos.ARTEFACTS_GROUP_SPREAD[ index ];

	// sort all available artefacts by group
	var artefacts = type.artefacts();
	var items = {};
	var i = 0;

	for (i = 0; i < artefacts.length; i++) {
		var artefact = artefacts[i][0];
		var chance = artefacts[i][1];

		if (!items[artefact.group]) {
			items[artefact.group] = [];
		}

		items[artefact.group].push({
			name: artefact.engName,
			chance: chance
		});
	}

	// select available groups
	var arrGroups = [];
	for (var name in groups) {
		arrGroups.push({
			name: name,
			chance: groups[name].chance,
			power: groups[name].power
		});
	}

	// select 3 artefacts
	var result = {};

	var maxValue = 0;
	for (i = 0; i < arrGroups.length; i++) {
		maxValue += arrGroups[i].chance;
	}

	for (i = 0; i < 3; i++) {
		// select random group
		var randomVal = Game.Random.random() * maxValue;
		var val = 0;

		for (var j = 0; j < arrGroups.length; j++) {
			val += arrGroups[j].chance;
			if (randomVal <= val) {
				break;
			}
		}

		var groupArtefacts = items[ arrGroups[j].name ];

		// select random artefact from chosen group
		if (groupArtefacts && groupArtefacts.length > 0) {
			var iRand = Game.Random.interval(0, groupArtefacts.length - 1);
			var randomItem = groupArtefacts[iRand];
			result[randomItem.name] = Math.floor(randomItem.chance * arrGroups[j].power * 100) / 100;
			groupArtefacts.splice(iRand, 1);
		}
	}

	return result;
};

Game.Planets.getArtefacts = function(planet, count) {
	if (!planet || !planet.artefacts) {
		return null;
	}

	count = (count && count > 1) ? count : 1;
	var result = null;

	for (var key in planet.artefacts) {
		// Average drop! No random!
		var income = Math.floor(count * planet.artefacts[key] / 100);

		if (Game.Random.interval(1, 99) <= count * planet.artefacts[key] % 100) {
			income++;
		}

		if (income > 0) {
			if (!result) {
				result = {};
			}
			result[key] = income;
		}
	}

	return result;
};

Game.Planets.generateType = function() {
	var result = null;
	var types = _.map(Game.Planets.types, function(item) {
		return item;
	});

	// select by chance
	if (types.length > 0) {

		var val = 0;
		var i = 0;

		for (i = 0; i < types.length; i++) {
			val += types[i].chance;
		}

		var randomVal = Game.Random.random() * val;
		val = 0;

		for (i = 0; i < types.length; i++) {
			val += types[i].chance;
			if (randomVal <= val) {
				result = types[i];
				break;
			}
		}
	}

	return result;
};

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
};

Game.Planets.getLastAttackTime = function() {
	var home = Game.Planets.getBase();
	if (home && home.timeLastAttack) {
		return home.timeLastAttack;
	}
	return 0;
};

Game.Planets.setLastAttackTime = function(time) {
	var home = Game.Planets.getBase();
	if (home) {
		home.timeLastAttack = time;
		Game.Planets.update(home);
	}
};

Game.Planets.getLastTradeFleetTime = function() {
	var home = Game.Planets.getBase();
	if (home && home.timeLastTradeFleet) {
		return home.timeLastTradeFleet;
	}
	return 0;
};

Game.Planets.setLastTradeFleetTime = function(time) {
	var home = Game.Planets.getBase();
	if (home) {
		home.timeLastTradeFleet = time;
		Game.Planets.update(home);
	}
};

Game.Planets.getLastFunTime = function() {
	var home = Game.Planets.getBase();
	if (home && home.timeLastFun) {
		return home.timeLastFun;
	}
	return 0;
};

Game.Planets.setLastFunTime = function(time) {
	var home = Game.Planets.getBase();
	if (home) {
		home.timeLastFun = time;
		Game.Planets.update(home);
	}
};

Game.Planets.generateMission = function(planet) {
	// check planets
	if (!planet) {
		return null;
	}

	var basePlanet = Game.Planets.getBase();
	if (!basePlanet) {
		return null;
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
};

Game.Planets.getReptileAttackChance = function() {
	var level = Game.User.getLevel();
	return {
		home: level * 5,
		colony: level * 1
	};
};

Game.Planets.getReptileAttackMission = function() {
	var level = Game.User.getLevel();

	// missions config
	var missions = Game.Cosmos.ATTACK_MISSIONS;

	// select mission
	if (level >= missions.length) {
		level = missions.length - 1;
	}

	var list = missions[ level ];
	if (!list || list.length <= 0) {
		return null;
	}

	var mission = list[ Game.Random.interval(0, list.length - 1) ];
	return {
		type: mission.type,
		level: mission.levels[ Game.Random.interval(0, mission.levels.length - 1) ]
	};
};

// ----------------------------------------------------------------------------
// Galactic generation
// ----------------------------------------------------------------------------

var radToDeg = function(rad) {
	return rad * 180 / Math.PI;
};

var calcDistanse = function(ax, ay, bx, by) {
	return Math.sqrt( Math.pow(bx - ax, 2) + Math.pow(by - ay, 2) );
};

var hitCircleVsCircle = function(x1, y1, r1, x2, y2, r2) {
	var distance = Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) );
	return (r1 + r2 > distance) ? true : false;
};

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
};

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
};

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
};

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
};

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
	var i = 0;

	for (i = 0; i < planets.length; i++) {
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

	for (i = 0; i < randSpots.length; i++) {
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
		);

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
		};

		Game.Planets.add(newPlanet);
		freeSpots.splice(n, 1);
	}
};

// ----------------------------------------------------------------------------
// Public methods
// ----------------------------------------------------------------------------

Meteor.methods({
	'planet.initialize': function() {
		// For planets initialization Meteor.user() required!
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('planet.initialize: ', new Date(), user.username);

		var planets = Game.Planets.getAll().fetch();

		if (planets.length === 0) {

			var galactic = {
				radius: 40,
				hands: Game.Random.interval(4, 6),
				segments: 10,
				rotationFactor: Game.Random.interval(2, 5) / 100, // 0.02 - 0.05
				narrowFactor: 5,
				angle: Game.Random.random() * Math.PI * 2, // 0 - 360
				minPlanets: 400,
				maxPlanets: 500
			};

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

			// refresh all planets
			Game.Planets.actualize();
		}
	},

	'planet.discover': function(planetId) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('planet.discover: ', new Date(), user.username);

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

		// save statistic
		Game.Statistic.incrementUser(user._id, {
			'cosmos.planets.discovered': 1
		});
	},

	'planet.sendFleet': function(baseId, targetId, units, isOneway) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('planet.sendFleet: ', new Date(), user.username);

		if (!Game.SpaceEvents.checkCanSendFleet()) {
			throw new Meteor.Error('Слишком много флотов уже отправлено');
		}

		if (baseId == targetId) {
			throw new Meteor.Error('Стартовая планета и конечная должны быть разными');
		}

		var targetPlanet = Game.Planets.getOne(targetId);
		if (!targetPlanet) {
			throw new Meteor.Error('Не найдена конечная планета');
		}

		var basePlanet = Game.Planets.getOne(baseId);
		if (!basePlanet) {
			throw new Meteor.Error('Не найдена стартовая планета');
		}

		// check is new colony
		var isLeavingBase = false;
		var isNewColony = false;

		if (isOneway && !targetPlanet.armyId && !targetPlanet.isHome) {
			isNewColony = true;

			if (!basePlanet.isHome && units) {
				// base planet is not our home, so we can leave it
				isLeavingBase = true;
				// test selected units vs available units
				var baseUnits = Game.Planets.getFleetUnits(baseId);
				for (var name in baseUnits) {
					if (baseUnits[name] > 0 && (!units[name] || baseUnits[name] > units[name])) {
						// not all selected, so we don't leaving base
						isLeavingBase = false;
						break;
					}
				}
			}
		}

		if (isNewColony && !Game.Planets.checkCanHaveMoreColonies(baseId, isLeavingBase, targetId)) {
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
		basePlanet.timeRespawn = Game.getCurrentTime() + Game.Cosmos.ENEMY_RESPAWN_PERIOD;
		Game.Planets.update(basePlanet);

		var startPosition = {
			x: basePlanet.x,
			y: basePlanet.y
		};

		var targetPosition = {
			x: targetPlanet.x,
			y: targetPlanet.y
		};

		var engineLevel = Game.Planets.getEngineLevel();

		var shipOptions = {
			startPosition:  startPosition,
			startPlanetId:  basePlanet._id,
			targetPosition: targetPosition,
			targetType:     Game.SpaceEvents.target.PLANET,
			targetId:       targetPlanet._id,
			startTime:      Game.getCurrentTime(),
			flyTime:        Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
			engineLevel:    engineLevel,
			isHumans:       true,
			isOneway:       isOneway,
			mission:        null,
			armyId:         newArmyId,
		};

		Game.SpaceEvents.sendShip(shipOptions);

		// if planet is colony
		if (!basePlanet.isHome && basePlanet.armyId) {
			// add reptiles attack trigger
			Game.SpaceEvents.addTriggerAttack({
				startTime: Game.getCurrentTime(),
				delayTime: Game.Cosmos.TRIGGER_ATTACK_DELAY,
				targetPlanet: basePlanet._id
			});
		}

		// save statistic
		Game.Statistic.incrementUser(user._id, {
			'cosmos.fleets.sent': 1
		});
	},

	'planet.changeName': function(planetId, name) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('planet.changeName: ', new Date(), user.username);

		check(planetId, String);
		check(name, String);
		name = name.trim();

		if (name.length === 0) {
			throw new Meteor.Error('Имя планеты не должно быть пустым');
		}

		if (name.length > 16) {
			throw new Meteor.Error('Максимум 16 символов');
		}

		var planet = Game.Planets.getOne(planetId);
		if (!planet || planet.isHome) {
			throw new Meteor.Error('Ты втираешь мне какую-то дичь');
		}

		var userResources = Game.Resources.getValue();
		if (userResources.credits.amount < Game.Planets.RENAME_PLANET_PRICE) {
			throw new Meteor.Error('Недостаточно ГГК');
		}

		Game.Resources.spend({
			credits: Game.Planets.RENAME_PLANET_PRICE
		});

		Game.Planets.Collection.update({
			_id: planet._id
		}, {
			$set: {
				name: name
			}
		});

		Game.Payment.Expense.log(Game.Planets.RENAME_PLANET_PRICE, 'planetRename', {
			planetId: planetId,
			newName: name,
			previousName: planet.name
		});
	},

	'planet.buyExtraColony': function() {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('planet.buyExtraColony: ', new Date(), user.username);

		if (Game.Planets.getExtraColoniesCount >= Game.Planets.MAX_EXTRA_COLONIES) {
			throw new Meteor.Error('Больше нельзя купить дополнительных колоний');
		}

		var price = Game.Planets.getExtraColonyPrice();
		var userResources = Game.Resources.getValue();
		if (userResources.credits.amount < price) {
			throw new Meteor.Error('Недостаточно ГГК');
		}

		Game.Resources.spend({
			credits: price
		});

		Game.Planets.Collection.update({
			user_id: Meteor.userId(),
			isHome: true
		}, {
			$inc: {
				extraColoniesCount: 1
			}
		});

		Game.Payment.Expense.log(price, 'planetBuy');
	}
});

Meteor.publish('planets', function () {
	if (this.userId) {
		return Game.Planets.Collection.find({
			user_id: this.userId
		});
	}
});

// ----------------------------------------------------------------------------
// Debug methods
// ----------------------------------------------------------------------------

Game.Planets.debugCalcArtefactsChances = function() {
	var items = {};
	var planetTypes = Game.Planets.types;

	for (var key in planetTypes) {
		var type = planetTypes[key];
		var artefacts = type.artefacts();

		for (var i = 0; i < artefacts.length; i++) {
			var name = artefacts[i][0].name;
			var group = artefacts[i][0].group;

			if (!items[group]) {
				items[group] = {};
			}

			if (!items[group][name]) {
				items[group][name] = 0;
			}

			items[group][name] += artefacts[i][1] * type.chance;
		}
	}

	for (var groupName in items) {
		console.log('================================================');
		for (var artefactName in items[groupName]) {
			console.log(items[groupName][artefactName], artefactName, groupName);
		}
	}
};

// Ask user to type in console Game.Planets.debugDump()
Game.Planets.debugImportCosmos = function(userId, planets, spaceEvents) {
	// clear cosmos + queue
	Game.Planets.Collection.remove({user_id: userId});
	Game.Queue.Collection.remove({user_id: userId});
	Game.SpaceEvents.Collection.remove({user_id: userId});

	// import planets
	var i = 0;
	for (i = 0; i < planets.length; i++) {
		var planet = planets[i];
		delete planet._id;
		planet.user_id = userId;
		Game.Planets.Collection.insert(planet);
	}

	// calculate oldest space event time delta
	var curTime = Game.getCurrentTime();
	var minTime = Number.MAX_VALUE;
	for (i = 0; i < spaceEvents.length; i++) {
		if (spaceEvents[i].timeStart < minTime) {
			minTime = spaceEvents[i].timeStart;
		}
	}

	var deltaTime = curTime - minTime;

	// import space events
	for (i = 0; i < spaceEvents.length; i++) {
		var event = spaceEvents[i];
		delete event._id;
		event.timeStart += deltaTime;
		event.timeEnd += deltaTime;
		event.user_id = userId;
		Game.SpaceEvents.Collection.insert(event);
	}
};

if (process.env.NODE_ENV == 'development') {
	Meteor.methods({
		'debug.importCosmos': function(planets, spaceEvents) {
			Game.Planets.debugImportCosmos(Meteor.userId(), planets, spaceEvents);
		}
	});
}

};