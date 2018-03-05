import { Meteor } from 'meteor/meteor';
import BuildingAbstract from '../lib/BuildingAbstract';
import BuildingCollection from '../lib/BuildingCollection';

let Game;
Meteor.startup(() => {
  // Temporary hack to avoid circular dependency
  // Must be changed to imports after
  // House, Cards, Achievements will be separate modules
  // eslint-disable-next-line global-require
  Game = require('/moduls/game/lib/main.game').default;
});

class Building extends BuildingAbstract {
  setLevel({
    level,
    user,
    userId = user ? user._id : Meteor.userId(),
  }) {
    BuildingCollection.upsert({
      user_id: userId,
    }, {
      $set: {
        [this.id]: level,
      },
    });
  }

  complete({
    level,
    user,
    userId = user ? user._id : Meteor.userId(),
  }) {
    this.setLevel({ level, userId });

    Game.Statistic.incrementUser(userId, {
      'building.total': 1,
    });
  }
}

export default Building;
