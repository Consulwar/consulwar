import Battle from './battle';

initBattle = function() {
	return;

	let battle = Battle.create(
		'Zav', {
			army: {
				fleet: {
					gammadrone: {
						count: 10,
						weapon: {
							damage: {min: 80, max: 100},
							signature: 100
						},
						health: {
							armor: 200,
							signature: 100
						}
					}
				}
			}
		},
		'ai1', {
			reptiles: {
				fleet: {
					sphero: {
						count: 41,
						weapon: {
							damage: {min: 40, max: 50},
							signature: 50
						},
						health: {
							armor: 100,
							signature: 50
						}
					}
				}
			}
		}
	);

	Battle.addGroup(battle.id, '1', 'Zav', {
		army: {
			fleet: {
				gammadrone: {
					count: 10,
					weapon: {
						damage: {min: 80, max: 110},
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

	Battle.addGroup(battle.id, '1', 'dwarf', {
		army: {
			fleet: {
				gammadrone: {
					count: 10,
					weapon: {
						damage: {min: 80, max: 110},
						signature: 100
					},
					health: {
						armor: 200,
						signature: 100
					}
				},

				wasp: {
					count: 10,
					weapon: {
						damage: {min: 240, max: 300},
						signature: 100
					},
					health: {
						armor: 500,
						signature: 100
					}
				}
			}
		}
	});

	let options = {
		damageReduction: 0,
		missionType: 'defencefleet',
		missionLevel: 1
	};

	battle = Battle.fromDB(battle.id);
	let result = battle.performSpaceRound(options);
	console.log(require('util').inspect(battle, false, null));
	console.log(require('util').inspect(result, false, null));

	// battle = Battle.fromDB(battle.id);
	// result = battle.performSpaceRound(options);
	// console.log(require('util').inspect(battle, false, null));
	// console.log(require('util').inspect(result, false, null));
};

