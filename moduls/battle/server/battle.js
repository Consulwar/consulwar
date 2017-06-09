import performRound from './performRound';

let Collection = new Meteor.Collection('battle');

Collection._ensureIndex({
	user_names: 1
});

let Status = {
	progress: 1,
	finish: 2
};

class Battle {
	static create() {
		let round = 1;
		let initialUnits = {};
		let armyPowers = {};
		let currentUnits = {};
		let battleUnits = {};

		let id = Collection.insert({
			status: Status.progress,
			time_start: Game.getCurrentTime(),
			round: round,
			user_names: [],
			initialUnits,
			armyPowers,
			currentUnits,
			battleUnits
		});

		return new Battle({_id: id, initialUnits, armyPowers, currentUnits, battleUnits, round});
	}

	static fromDB(id) {
		let battle = Collection.findOne({_id: id});

		return new Battle(battle);
	}

	static findForUsername(username) {
		return Collection.find({user_names: username}).fetch();
	}

	constructor({_id, initialUnits, armyPowers, currentUnits, battleUnits, round}) {
		this.id = _id;

		this.initialUnits = initialUnits;
		this.armyPowers = armyPowers;
		this.currentUnits = currentUnits;
		this.battleUnits = battleUnits;
		this.round = round;
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

		if (parseInt(side, 10) === 1) {
			modifier.$addToSet = {
				user_names: username
			};

			modifier.$inc = {
				[`armyPowers.${username}`]: groupPower
			};
		}

		Collection.update({_id: id}, modifier);
	}

	performSpaceRound(options) {
		let roundResult = performRound(this, options);

		this.update({
			$set: {
				battleUnits: this.battleUnits
			},
			$inc: roundResult.decrement
		});

		let userArmyRest = '1' in roundResult.left;
		let enemyArmyRest = '2' in roundResult.left;

		this.giveHonor(roundResult, options);
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
		let killedCost = Game.Unit.calculateArmyCost(roundResult.killed[2]);
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
		if (_.keys(this.currentUnits[1]).length === 1) {
			this.saveSingleUserStatistic(roundResult);
		} else {
			this.saveMultiUsersStatistic(roundResult);
		}
	}

	saveSingleUserStatistic(roundResult) {
		let increment = {};

		let userUnits = roundResult.killed[1];
		let totalLost = 0;

		traverseGroup(userUnits, function(armyName, typeName, unitName, count) {
			increment[`units.lost.${armyName}.${typeName}.${unitName}`] = count;
			totalLost += count;
		});

		increment['units.lost.total'] = totalLost;

		let enemyUnits = roundResult.killed[2];
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
		let userNames = _.keys(this.currentUnits[1]);

		console.log('multiUsers', increment);
		//todo Game.Statistic.incrementGroupUserNames(userNames, increment);
	}

	finishBattle(userArmyRest, enemyArmyRest, options) {
		this.giveReward(userArmyRest, enemyArmyRest, options);
		this.saveBattleStatistic(userArmyRest, enemyArmyRest, options);

		this.update({
			$set: {
				status: Status.finish
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
			let killedArmy = this.calculateTotalKilled(2);
			let killedCost = Game.Unit.calculateArmyCost(killedArmy);

			totalReward.metals = Math.floor( killedCost.metals * 0.1 );
			totalReward.crystals = Math.floor( killedCost.crystals * 0.1 );
		}

		// reward bonus
		if (options.missionType === 'tradefleet') {
			totalReward = Game.Effect.Special.applyTo({ engName: 'tradefleetBonus' }, totalReward, true);
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
		let userNames = _.keys(this.currentUnits[1]);

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
			} else if (enemyArmyRest) {
				result = Game.Battle.result.defeat;
			}
		}

		let increment = {};

		increment[`${fieldName}.total`] = 1;
		if (result === Game.Battle.result.tie) {
			increment[`${fieldName}.tie`] = 1;
		} else if (result === Game.Battle.result.victory) {
			increment[`${fieldName}.victory`] = 1;
		} else if (result === Game.Battle.result.defeat) {
			increment[`${fieldName}.defeat`] = 1;
		} else if (result === Game.Battle.result.damage) {
			increment[`${fieldName}.damage`] = 1;
		} else if (result === Game.Battle.result.damageVictory) {
			increment[`${fieldName}.damageVictory`] = 1;
		}

		if (options.missionType && options.missionLevel) {
			increment[`${fieldName}.` + options.missionType + '.total'] = 1;
			increment[`${fieldName}.` + options.missionType + '.' + options.missionLevel + '.total'] = 1;
			if (result === Game.Battle.result.tie) {
				increment[`${fieldName}.` + options.missionType + '.tie'] = 1;
				increment[`${fieldName}.` + options.missionType + '.' + options.missionLevel + '.tie'] = 1;
			} else if (result === Game.Battle.result.victory) {
				increment[`${fieldName}.` + options.missionType + '.victory'] = 1;
				increment[`${fieldName}.` + options.missionType + '.' + options.missionLevel + '.victory'] = 1;
			} else if (result === Game.Battle.result.defeat) {
				increment[`${fieldName}.` + options.missionType + '.defeat'] = 1;
				increment[`${fieldName}.` + options.missionType + '.' + options.missionLevel + '.defeat'] = 1;
			} else if (result === Game.Battle.result.damage) {
				increment[`${fieldName}.` + options.missionType + '.damage'] = 1;
				increment[`${fieldName}.` + options.missionType + '.' + options.missionLevel + '.damage'] = 1;
			} else if (result === Game.Battle.result.damageVictory) {
				increment[`${fieldName}.` + options.missionType + '.damageVictory'] = 1;
				increment[`${fieldName}.` + options.missionType + '.' + options.missionLevel + '.damageVictory'] = 1;
			}
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

export default Battle;
