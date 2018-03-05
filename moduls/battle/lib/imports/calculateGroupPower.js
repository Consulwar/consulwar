import { _ } from 'meteor/underscore';

const calculateGroupPower = function(group) {
  let power = 0;
  let totalDamage = 0;
  let totalLife = 0;

  _(group).pairs().forEach(([, unit]) => {
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
