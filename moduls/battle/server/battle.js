import performRound from './performRound';

let Collection = new Meteor.Collection('battle');

Collection._ensureIndex({
	user_names: 1
});

let Status = {
	progress: 1,
	finish: 2
};

const USER_SIDE = '1';
const ENEMY_SIDE = '2';

class Battle {
	static create(username, userArmy, enemyName, enemyArmy) {
		traverseGroup(userArmy, function(armyName, typeName, unitName, count) {
			userArmy[armyName][typeName][unitName] = createUnit(armyName, typeName, unitName, count);
		});

		traverseGroup(enemyArmy, function(armyName, typeName, unitName, count) {
			enemyArmy[armyName][typeName][unitName] = createUnit(armyName, typeName, unitName, count);
		});

		let round = 1;

		let initialUnits = {
			[USER_SIDE]: {
				[username]: [userArmy]
			},
			[ENEMY_SIDE]: {
				[enemyName]: [enemyArmy]
			}
		};

		let armyPowers = {
			[username]: calculateGroupPower(userArmy)
		};

		let currentUnits = deepClone(initialUnits);
		let battleUnits = {};
		let status = Status.progress;

		let id = Collection.insert({
			status: status,
			time_start: Game.getCurrentTime(),
			round: round,
			user_names: [username],
			initialUnits,
			armyPowers,
			currentUnits,
			battleUnits
		});

		return new Battle({_id: id, initialUnits, armyPowers, currentUnits, battleUnits, round, status});
	}

	static fromDB(id) {
		let battle = Collection.findOne({_id: id});

		return new Battle(battle);
	}

	static findForUsername(username) {
		return Collection.find({user_names: username}).fetch();
	}

	static addGroup(id, side, username, group) {
		let key = `${side}.${username}`;

		let groupPower = calculateGroupPower(group);

		let modifier = {
			$push: {
				[`initialUnits.${key}`]: group,
				[`currentUnits.${key}`]: group
			}
		};

		if (side === USER_SIDE) {
			modifier.$addToSet = {
				user_names: username
			};

			modifier.$inc = {
				[`armyPowers.${username}`]: groupPower
			};
		}

		Collection.update({_id: id}, modifier);
	}

	constructor({_id, initialUnits, armyPowers, currentUnits, battleUnits, round, status}) {
		this.id = _id;

		this.status = status;
		this.initialUnits = initialUnits;
		this.armyPowers = armyPowers;
		this.currentUnits = currentUnits;
		this.battleUnits = battleUnits;
		this.round = round;
	}

	performSpaceRound(options) {
		let roundResult = this.performRound(options);

		this.giveHonor(roundResult, options);

		return roundResult;
	}

	performEarthRound(options) {
		return this.performRound(options);
	}

	performRound(options) {
		let roundResult = performRound(this, options.damageReduction);

		this.update({
			$set: {
				battleUnits: this.battleUnits
			},
			$inc: roundResult.decrement
		});

		let userArmyRest = USER_SIDE in roundResult.left;
		let enemyArmyRest = ENEMY_SIDE in roundResult.left;

		this.saveRoundStatistic(roundResult);

		if (!userArmyRest || !enemyArmyRest) {
			this.finishBattle(userArmyRest, enemyArmyRest, options);
		} else {
			this.update({
				$inc: {
					round: 1
				}
			});
		}

		return roundResult;
	}

	update(modifier) {
		return Collection.update({_id: this.id}, modifier);
	}

	giveHonor(roundResult, options) {
		let killedCost = Game.Unit.calculateArmyCost(roundResult.killed[ENEMY_SIDE]);
		let mission = Game.Battle.items[ options.missionType ];
		let totalHonor = (getPoints(killedCost) / 100) * (mission.honor * 0.01);

		if (totalHonor > 0) {
			let armyPowers = this.armyPowers;
			let totalPower = calculateTotalPower(armyPowers);

			let dividedHonor = totalHonor / totalPower;

			for (let username in armyPowers) {
				if (armyPowers.hasOwnProperty(username)) {
					let honor = Math.floor(dividedHonor * armyPowers[username]);
					let user = Meteor.users.findOne({username});

					Game.Resources.add({honor}, user._id);
				}
			}
		}
	}

	saveRoundStatistic(roundResult) {
		if (_.keys(this.currentUnits[USER_SIDE]).length === 1) {
			this.saveSingleUserStatistic(roundResult);
		} else {
			this.saveMultiUsersStatistic(roundResult);
		}
	}

	saveSingleUserStatistic(roundResult) {
		let increment = {};

		let userUnits = roundResult.killed[USER_SIDE];
		let totalLost = 0;

		traverseGroup(userUnits, function(armyName, typeName, unitName, count) {
			increment[`units.lost.${armyName}.${typeName}.${unitName}`] = count;
			totalLost += count;
		});

		increment['units.lost.total'] = totalLost;

		let enemyUnits = roundResult.killed[ENEMY_SIDE];
		totalLost = 0;

		traverseGroup(enemyUnits, function(armyName, typeName, unitName, count) {
			increment[`reptiles.killed.${armyName}.${typeName}.${unitName}`] = count;
			totalLost += count;
		});

		increment['reptiles.killed.total'] = totalLost;

		Game.Statistic.incrementUser(Meteor.userId(), increment);
	}

	saveMultiUsersStatistic(roundResult) {
		let increment = {};
		let userNames = _.keys(this.currentUnits[USER_SIDE]);

		console.log('multiUsers', increment);
		//todo Game.Statistic.incrementGroupUserNames(userNames, increment);
	}

	finishBattle(userArmyRest, enemyArmyRest, options) {
		this.status = Status.finish;

		this.giveReward(userArmyRest, enemyArmyRest, options);
		this.saveBattleStatistic(userArmyRest, enemyArmyRest, options);

		this.update({
			$set: {
				status: this.status
			}
		});
	}

	giveReward(userArmyRest, enemyArmyRest, options) {
		if (!userArmyRest || enemyArmyRest) {
			return;
		}

		let totalReward = {};
		let mission = Game.Battle.items[ options.missionType ].level[ options.missionLevel ];

		if (mission.reward) {
			totalReward.metals = mission.reward.metals;
			totalReward.crystals = mission.reward.crystals;
		} else {
			let killedArmy = this.calculateTotalKilled(ENEMY_SIDE);
			let killedCost = Game.Unit.calculateArmyCost(killedArmy);

			totalReward.metals = Math.floor( killedCost.metals * 0.1 );
			totalReward.crystals = Math.floor( killedCost.crystals * 0.1 );
		}

		let armyPowers = this.armyPowers;
		let totalPower = calculateTotalPower(armyPowers);

		let dividedReward = {
			metals: totalReward.metals / totalPower,
			crystals: totalReward.crystals / totalPower
		};

		for (let username in armyPowers) {
			if (armyPowers.hasOwnProperty(username)) {
				let groupPower = armyPowers[username];

				let reward = {
					metals: Math.floor(dividedReward.metals * groupPower),
					crystals: Math.floor(dividedReward.crystals * groupPower)
				};

				let user = Meteor.users.findOne({username});
				Game.Resources.add(reward, user._id);
			}
		}
	}

	saveBattleStatistic(userArmyRest, enemyArmyRest, options) {
		let userNames = _.keys(this.currentUnits[USER_SIDE]);

		let fieldName = (userNames.length === 1) ? 'battle' : 'multiUsersBattle';

		let result;
		if (options.isOnlyDamage) {
			if (enemyArmyRest) {
				result = Game.Battle.result.damage;
			} else {
				result = Game.Battle.result.damageVictory;
			}
		} else {
			if (userArmyRest && enemyArmyRest) {
				result = Game.Battle.result.tie;
			} else if(userArmyRest) {
				result = Game.Battle.result.victory;
			} else {
				result = Game.Battle.result.defeat;
			}
		}

		let increment = {};

		increment[`${fieldName}.total`] = 1;

		let resultName = Game.Battle.resultNames[result];
		increment[`${fieldName}.${resultName}`] = 1;

		if (options.missionType && options.missionLevel) {
			increment[`${fieldName}.${options.missionType}.total`] = 1;
			increment[`${fieldName}.${options.missionType}.${options.missionLevel}.total`] = 1;

			increment[`${fieldName}.${options.missionType}.${resultName}`] = 1;
			increment[`${fieldName}.${options.missionType}.${options.missionLevel}.${resultName}`] = 1;
		}

		Game.Statistic.incrementGroupUserNames(userNames, increment);
	}

	calculateTotalKilled(sideName) {
		let initialUnits = this.initialUnits;
		let result = {};

		traverseSide(this.currentUnits, sideName, function(username, groupNum, group) {
			traverseGroup(group, function(armyName, typeName, unitName, unit) {
				let diff = initialUnits[sideName][username][groupNum][armyName][typeName][unitName].count - unit.count;

				if (!result[armyName]) {
					result[armyName] = {};
				}

				if (!result[armyName][typeName]) {
					result[armyName][typeName] = {};
				}

				if (!result[armyName][typeName][unitName]) {
					result[armyName][typeName][unitName] = 0;
				}

				result[armyName][typeName][unitName] += diff;
			});
		});

		return result;
	}

	traverse(callback) {
		traverseUnits(this.currentUnits, function(sideName, username, groupNum, group){
			traverseGroup(group, function(armyName, typeName, unitName, unit) {
				callback({
					unit,
					sideName,
					username,
					groupNum,
					armyName,
					typeName,
					unitName
				});
			});
		});
	}
}

Battle.Status = Status;

let calculateGroupPower = function(group) {
	let totalDamage = 0;
	let totalLife = 0;

	traverseGroup(group, function(armyName, typeName, unitName, unit) {
		totalDamage += unit.weapon.damage.max * unit.count;
		totalLife += unit.health.armor * unit.count;
	});

	return Math.floor((totalDamage / 1000) + (totalLife / 2000));
};

let calculateTotalPower = function(armyPowers) {
	let totalPower = 0;

	for (let username in armyPowers) {
		if (armyPowers.hasOwnProperty(username)) {
			totalPower += armyPowers[username];
		}
	}

	return totalPower;
};

let traverseUnits = function(units, callback) {
	for (let sideName in units) {
		if (!units.hasOwnProperty(sideName)) {
			continue;
		}

		traverseSide(units, sideName, function(username, groupNum, group) {
			callback(sideName, username, groupNum, group);
		});
	}
};

let traverseSide = function(units, sideName, callback) {
	let side = units[sideName];

	for (let username in side) {
		if (!side.hasOwnProperty(username)) {
			continue;
		}
		let groups = side[username];

		for (let groupNum = 0; groupNum < groups.length; groupNum++) {
			let group = groups[groupNum];

			callback(username, groupNum, group);
		}
	}
};

let traverseGroup = function(group, callback) {
	for (let armyName in group) {
		if (!group.hasOwnProperty(armyName)) {
			continue;
		}
		let army = group[armyName];

		for (let typeName in army) {
			if (!army.hasOwnProperty(typeName)) {
				continue;
			}

			let armyUnits = army[typeName];

			for (let unitName in armyUnits) {
				if (!armyUnits.hasOwnProperty(unitName)) {
					continue;
				}

				callback(armyName, typeName, unitName, armyUnits[unitName]);
			}
		}
	}
};

let getPoints = function(resources) {
	let points = 0;
	for (let res in resources) {
		if (resources.hasOwnProperty(res)) {
			if (res !== 'time') {
				points += resources[res] * (res === 'crystals' ? 3 : res === 'humans' ? 4 : 1);
			}
		}
	}
	return points;
};

let deepClone = function(object) {
	let clone = _.clone(object);

	_.each(clone, function(value, key) {
		if (_.isObject(value)) {
			clone[key] = deepClone(value);
		}
	});

	return clone;
};

let createUnit = function(armyName, typeName, unitName, count) {
	let characteristics = Game.Unit.items[armyName][typeName][unitName].characteristics;

	return {
		count: Game.Unit.rollCount(count),
		weapon: {
			damage: {min: characteristics.weapon.damage.min, max: characteristics.weapon.damage.max},
			signature: characteristics.weapon.signature
		},
		health: {
			armor: characteristics.health.armor,
			signature: characteristics.health.signature
		}
	};
};

export default Battle;
