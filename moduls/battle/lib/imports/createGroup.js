import traverseGroup from './traverseGroup';

const createUnit = function (armyName, typeName, unitName, count) {
  // TODO: need to use user effects
  const characteristics = Game.Unit.items[armyName][typeName][unitName].options.characteristics;

  return {
    count,
    weapon: {
      damage: {
        min: characteristics.weapon.damage.min,
        max: characteristics.weapon.damage.max,
      },
      signature: characteristics.weapon.signature,
    },
    health: {
      armor: characteristics.health.armor,
      signature: characteristics.health.signature,
    },
  };
};

export default function (army) {
  const group = Game.Helpers.deepClone(army);

  traverseGroup(group, function (armyName, typeName, unitName, count) {
    const realCount = Game.Unit.rollCount(count);

    if (realCount > 0) {
      const unit = createUnit(armyName, typeName, unitName, realCount);
      group[armyName][typeName][unitName] = unit;
    }
  });

  return group;
}
