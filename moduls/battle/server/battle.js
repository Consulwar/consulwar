import Group from '../imports/group';

initBattle = function() {

	let userArmy = {
		army: {
			fleet: {
				gammadrone: 100,
				wasp: 10,
				// mirage: 40,
				// cruiser: 10
			}
		}
	};
	let enemyArmy = {
		reptiles: {
			fleet: {
				sphero: 100,
				blade: 10,
				// lacertian: 40,
				wyvern: 1
			}
		}
	};

	let group1 = Group.fromObject(userArmy);
	let group2 = Group.fromObject(enemyArmy);

	// perform Round #1
	round(1, group1, group2);

	group1 = Group.fromObject(group1.getAliveObject());
	group2 = Group.fromObject(group2.getAliveObject());

	round(2, group1, group2);

	group1 = Group.fromObject(group1.getAliveObject());
	group2 = Group.fromObject(group2.getAliveObject());

	round(3, group1, group2);

	group1 = Group.fromObject(group1.getAliveObject());
	group2 = Group.fromObject(group2.getAliveObject());

	round(4, group1, group2);
};

let round = function(number, group1, group2) {
	let damageList1 = group1.getDamageList();
	let damageList2 = group2.getDamageList();

	fire(damageList1, group2);
	fire(damageList2, group1);

	console.log(number, group1.toJSON());
	console.log(number, group2.toJSON());
};

let fire = function(damageList, target) {
	for (let [unit, damage] of damageList) {
		target.receiveDamage(unit, damage);
	}
};
