import { Meteor } from 'meteor/meteor';
import traverseGroup from '/moduls/battle/lib/imports/traverseGroup';
import Game from '/moduls/game/lib/main.game';
import { _ } from 'meteor/underscore';

initWrecksServer = function() {
'use strict';

initWrecksLib();
initWrecksConfigLib();

Game.Wrecks.Collection._ensureIndex({
  userId: 1,
});

Game.Wrecks.actualize = function(userId = Meteor.userId()) {
  const wrecks = Game.Wrecks.Collection.findOne({ userId });

  if (!wrecks) {
    return;
  }

  const delta = (new Date() - wrecks.updated) / 1000;

  const modifier = {
    $set: {
      updated: new Date(),
    },
  };

  traverseGroup(wrecks.units, (sideName, typeName, unitName, info) => {
    const unit = Game.Unit.items[sideName][typeName][unitName];

    const result = Game.Wrecks.decay(unit, delta, info.bonusSeconds);

    const key = `units.${sideName}.${typeName}.${unitName}`;

    if (result.count >= info.count) {
      if (!modifier.$unset) {
        modifier.$unset = {};
      }

      modifier.$unset[key] = 1;
    } else {
      modifier.$set[key] = {
        count: info.count - result.count,
        bonusSeconds: result.bonusSeconds,
      };
    }
  });

  Game.Wrecks.Collection.update({ _id: wrecks._id }, modifier);
};

Game.Wrecks.addUnits = function({ units, userId = Meteor.userId() }) {
  if (!units.army) {
    return;
  }

  const $inc = {};

  _(units.army).pairs().forEach(([groupName, group]) => {
    _(group).pairs().forEach(([engName, count]) => {
      $inc[`units.army.${groupName}.${engName}.count`] = count;
    });
  });

  Game.Wrecks.Collection.upsert({
    userId,
  }, {
    $inc,
    $setOnInsert: {
      updated: new Date(),
    },
  });
};

Game.Wrecks.removeUnit = function(wrecks, group, engName) {
  Game.Wrecks.Collection.update({
    _id: wrecks._id,
  }, {
    $unset: {
      [`units.army.${group}.${engName}`]: 1,
    },
  });
};
};
