import traverseGroup from './traverseGroup';

let calculateGroupPower = function(group) {
	let power = 0;
	let totalDamage = 0;
	let totalLife = 0;

	traverseGroup(group, function(armyName, typeName, unitName, unit) {
		if (_.isNumber(unit.power)) {
			power += unit.power * unit.count;
		} else {
			totalDamage += unit.weapon.damage.max * unit.count;
			totalLife += unit.health.armor * unit.count;
		}
	});

	return power + Math.floor((totalDamage / 1000) + (totalLife / 2000));
};

export default calculateGroupPower;