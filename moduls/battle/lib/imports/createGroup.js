import { Meteor } from 'meteor/meteor';

let unitItems;
Meteor.startup(() => {
  if (Meteor.isClient) {
    unitItems = require('/imports/content/Unit/client').default;
  } else {
    unitItems = require('/imports/content/Unit/server').default;
  }
});

const createUnit = function ({ id, count, userId }) {
  let characteristics;

  if (userId) {
    characteristics = unitItems[id].getCharacteristics({ userId });
  } else {
    characteristics = unitItems[id].getBaseCharacteristics();
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
  const group = {};

  _(army).pairs().forEach(([id, count]) => {
    const realCount = Game.Unit.rollCount(count);

    if (realCount > 0) {
      const unit = createUnit({ id, count: realCount, userId });

      group[id] = unit;
    }
  });

  return group;
}
