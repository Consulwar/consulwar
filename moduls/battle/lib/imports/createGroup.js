import traverseGroup from './traverseGroup';

const createUnit = function (armyName, typeName, unitName, count) {
  const characteristics = Game.Unit.items[armyName][typeName][unitName].options.characteristics;

  return {
    count: Game.Unit.rollCount(count),
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
    const unit = createUnit(armyName, typeName, unitName, count);
    group[armyName][typeName][unitName] = unit;
  });

  return group;
}
