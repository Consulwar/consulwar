import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import { _ } from 'meteor/underscore';
import unitItems from '/imports/content/Unit/server';

initWrecksServer = function() {
'use strict';

initWrecksLib();

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

  _(wrecks.units).pairs().forEach(([id, info]) => {
    const unit = unitItems[id];

    const result = Game.Wrecks.decay(unit, delta, info.bonusSeconds);

    const key = `units.${id}`;

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
  if (!units) {
    return;
  }

  const $inc = {};

  _(units).pairs().forEach(([id, count]) => {
    // Do not add flagship to wrecks
    if (id !== 'Unit/Human/Space/Flagship') {
      $inc[`units.${id}.count`] = count;
    }
  });

  if (_($inc).keys().length > 0) {
    Game.Wrecks.Collection.upsert({
      userId,
    }, {
      $inc,
      $setOnInsert: {
        updated: new Date(),
      },
    });
  }
};

Game.Wrecks.removeUnit = function(wrecks, id) {
  Game.Wrecks.Collection.update({
    _id: wrecks._id,
  }, {
    $unset: {
      [`units.${id}`]: 1,
    },
  });
};

Meteor.publish('wrecks', function () {
  if (this.userId) {
    return Game.Wrecks.Collection.find({
      userId: this.userId,
    }, {
      fields: {
        userId: 1,
        units: 1,
      },
    });
  }
  return null;
});

};
