import Group from '../imports/group';

let deepClone = function(object) {
	let clone = _.clone(object);

	_.each(clone, function(value, key) {
		if (_.isObject(value)) {
			clone[key] = deepClone(value);
		}
	});

	return clone;
};

class Battle {
	constructor(initialUnits, currentUnits, battleUnits) {
		this.initialUnits = initialUnits;
		this.currentUnits = currentUnits;
		this.battleUnits = battleUnits;
	}

	addGroup(side, username, group) {
		if (!this.initialUnits[side]) {
			this.initialUnits[side] = {};
		}

		if (!this.initialUnits[side][username]) {
			this.initialUnits[side][username] = [];
		}

		this.initialUnits[side][username].push( deepClone(group) );

		if (!this.currentUnits[side]) {
			this.currentUnits[side] = {};
		}

		if (!this.currentUnits[side][username]) {
			this.currentUnits[side][username] = [];
		}

		this.currentUnits[side][username].push( deepClone(group) );
	}

	mergeGroups() {
		for (let sideName in this.currentUnits) {
			if (!this.currentUnits.hasOwnProperty(sideName)) {
				continue;
			}

			if (!this.battleUnits[sideName]) {
				this.battleUnits[sideName] = {};
			}

			let users = this.currentUnits[sideName];

			for (let username in users) {
				if (!users.hasOwnProperty(username)) {
					continue;
				}

				let userGroups = users[username];

				for (let group of userGroups) {
					for (let armyName in group) {
						if (!group.hasOwnProperty(armyName)) {
							continue;
						}
						let army = group[armyName];
						if (!this.battleUnits[sideName][armyName]) {
							this.battleUnits[sideName][armyName] = {};
						}

						for (let typeName in army) {
							if (!army.hasOwnProperty(typeName)) {
								continue;
							}
							let units = army[typeName];
							if (!this.battleUnits[sideName][armyName][typeName]) {
								this.battleUnits[sideName][armyName][typeName] = {};
							}

							for (let unitName in units) {
								if (!units.hasOwnProperty(unitName)) {
									continue;
								}

								let unit = units[unitName];

								if (!this.battleUnits[sideName][armyName][typeName][unitName]) {
									this.battleUnits[sideName][armyName][typeName][unitName] = {
										count: unit.count,
										weapon: {
											damage: unit.weapon.damage,
											signature: unit.weapon.signature
										},
										health: {
											armor: unit.health.armor,
											signature: unit.health.signature,
											total: unit.health.armor * unit.count
										}
									};
								} else {
									let battleUnit = this.battleUnits[sideName][armyName][typeName][unitName];

									mergeParam(battleUnit, unit, 'weapon', 'damage');
									mergeParam(battleUnit, unit, 'weapon', 'signature');

									mergeParam(battleUnit, unit, 'health', 'armor');
									mergeParam(battleUnit, unit, 'health', 'signature');

									battleUnit.health.total += unit.health.armor * unit.count;

									battleUnit.count += unit.count;
								}
							}
						}
					}
				}
			}
		}
	}

	calcBattleHealth() {
		for (let sideName in this.battleUnits) {
			if (!this.battleUnits.hasOwnProperty(sideName)) {
				continue;
			}

			let group = this.battleUnits[sideName];

			for (let armyName in group) {
				if (!group.hasOwnProperty(armyName)) {
					continue;
				}
				let army = group[armyName];

				for (let typeName in army) {
					if (!army.hasOwnProperty(typeName)) {
						continue;
					}
					let units = army[typeName];

					for (let unitName in units) {
						if (!units.hasOwnProperty(unitName)) {
							continue;
						}

						let unit = units[unitName];

						let battleUnit = this.battleUnits[sideName][armyName][typeName][unitName];

						let totalHP = battleUnit.health.armor * battleUnit.count;

						let killed = (totalHP - battleUnit.health.total) / battleUnit.health.armor;

						battleUnit.health.total = -(totalHP - Math.floor(killed) * unit.health.armor - battleUnit.health.total);

						battleUnit.weapon.damage = 0;
						battleUnit.weapon.signature = 0;

						battleUnit.health.armor = 0;
						battleUnit.health.signature = 0;

						battleUnit.count = 0;
					}
				}
			}
		}
	}
}

let mergeParam = function(u1, u2, type, name) {
	u1[type][name] = (u1[type][name] * u1.count + u2[type][name] * u2.count) / (u1.count + u2.count);
};

initBattle = function() {
	let battle = new Battle({}, {}, {});

	battle.addGroup(1, 'Zav', {
		army: {
			fleet: {
				gammadrone: {
					count: 10,
					weapon: {
						damage: 100,
						signature: 100
					},
					health: {
						armor: 200,
						signature: 100
					}
				}
			}
		}
	});

	battle.addGroup(1, 'Zav', {
		army: {
			fleet: {
				gammadrone: {
					count: 10,
					weapon: {
						damage: 110,
						signature: 100
					},
					health: {
						armor: 200,
						signature: 100
					}
				}
			}
		}
	});

	battle.addGroup(1, 'dwarf', {
		army: {
			fleet: {
				gammadrone: {
					count: 10,
					weapon: {
						damage: 100,
						signature: 100
					},
					health: {
						armor: 200,
						signature: 100
					}
				},
				wasp: {
					count: 5,
					weapon: {
						damage: 150,
						signature: 150
					},
					health: {
						armor: 500,
						signature: 200
					}
				}
			}
		}
	});

	battle.addGroup(2, 'ai1', {
		reptiles: {
			fleet: {
				sphero: {
					count: 41,
					weapon: {
						damage: 50,
						signature: 50
					},
					health: {
						armor: 100,
						signature: 50
					}
				}
			}
		}
	});

	battle.mergeGroups();

	let group1 = Group.fromObject(battle.battleUnits[1]);
	let group2 = Group.fromObject(battle.battleUnits[2]);

	roundGroups(1, group1, group2);

	for (let sideName in battle.currentUnits) {
		if (!battle.currentUnits.hasOwnProperty(sideName)) {
			continue;
		}

		let side = battle.currentUnits[sideName];

		let battleUnits = battle.battleUnits[sideName];

		for (let username in side) {
			if (!side.hasOwnProperty(username)) {
				continue;
			}
			let groups = side[username];

			for (let group of groups) {

				for (let armyName in group) {
					if (!group.hasOwnProperty(armyName)) {
						continue;
					}
					let army = group[armyName];

					for (let typeName in army) {
						if (!army.hasOwnProperty(typeName)) {
							continue;
						}

						let units = army[typeName];

						for (let unitName in units) {
							if (!units.hasOwnProperty(unitName)) {
								continue;
							}

							let unit = units[unitName];

							let battleUnit = battleUnits[armyName][typeName][unitName];

							let alive = battleUnit.health.total / battleUnit.health.armor;

							let floatCurrentAlive = unit.count / battleUnit.count * alive;

							unit.count = Math.floor(floatCurrentAlive) + Game.Random.chance(floatCurrentAlive % 1 * 100);
						}
					}
				}
			}
		}
	}

	battle.calcBattleHealth();
	battle.mergeGroups();

	console.log(require('util').inspect(battle, false, null));
};

let roundGroups = function(number, group1, group2) {
	// console.log(number, group1.toJSON());
	// console.log(number, group2.toJSON());

	let damageList1 = group1.getDamageList();
	let damageList2 = group2.getDamageList();

	fire(damageList1, group2);
	fire(damageList2, group1);

	// console.log(number, group1.toJSON());
	// console.log(number, group2.toJSON());
};

let fire = function(damageList, target) {
	for (let [unit, damage] of damageList) {
		target.receiveDamage(unit, damage);
	}
};
