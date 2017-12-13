import traverseGroup from './traverseGroup';

const createUnit = function ({ armyName, typeName, unitName, count, userId }) {
  let characteristics;

  if (userId) {
    characteristics = Game.Unit.items[armyName][typeName][unitName].getCharacteristics({ userId });
  } else {
    characteristics = Game.Unit.items[armyName][typeName][unitName].getBaseCharacteristics();
  }

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

export default function ({ army, userId }) {
  const group = Game.Helpers.deepClone(army);

  traverseGroup(group, function (armyName, typeName, unitName, count) {
    const realCount = Game.Unit.rollCount(count);

    if (realCount > 0) {
      const unit = createUnit({ armyName, typeName, unitName, count: realCount, userId});
      group[armyName][typeName][unitName] = unit;
    }
  });

  return group;
}
