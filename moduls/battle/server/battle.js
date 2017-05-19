import BattleSide from '../imports/side';
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

	let group1 = Group.fromObject({army: {fleet: {gammadrone: 100}}});
	let group2 = Group.fromObject(enemyArmy);
	let group3 = Group.fromObject({army: {fleet: {wasp: 10}}});

	let side1 = new BattleSide();
	side1.addGroup(group1);
	side1.addGroup(group3);

	let side2 = new BattleSide();
	side2.addGroup(group2);

	roundSides(1, side1, side2);

	// perform Round #1
	roundGroups(1, group1, group2);

	group1 = Group.fromObject(group1.getAliveObject());
	group2 = Group.fromObject(group2.getAliveObject());

	roundGroups(2, group1, group2);

	group1 = Group.fromObject(group1.getAliveObject());
	group2 = Group.fromObject(group2.getAliveObject());

	roundGroups(3, group1, group2);

	group1 = Group.fromObject(group1.getAliveObject());
	group2 = Group.fromObject(group2.getAliveObject());

	roundGroups(4, group1, group2);
};

let roundSides = function(number, side1, side2) {
	let groups1 = side1.getGroups();
	let groups2 = side2.getGroups();

	let damageList1 = side1.getDamageList();
	let damageList2 = side2.getDamageList();

	fire(damageList1, side2);
	fire(damageList2, side1);

	console.log(number, side1.toJSON());
	console.log(number, side2.toJSON());
};

let roundGroups = function(number, group1, group2) {
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
