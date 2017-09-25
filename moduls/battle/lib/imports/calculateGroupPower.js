import { _ } from 'meteor/underscore';
import traverseGroup from './traverseGroup';

const calculateGroupPower = function(group) {
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

  return power + Math.floor((totalDamage / 50) + (totalLife / 100));
};

export default calculateGroupPower;
