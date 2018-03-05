import { Meteor } from 'meteor/meteor';
import ResearchAbstract from '../lib/ResearchAbstract';
import ResearchCollection from '../lib/ResearchCollection';

let Game;
Meteor.startup(() => {
  // Temporary hack to avoid circular dependency
  // Must be changed to imports after
  // House, Cards, Achievements will be separate modules
  // eslint-disable-next-line global-require
  Game = require('/moduls/game/lib/main.game').default;
});

class Research extends ResearchAbstract {
  setLevel({
    level,
    user,
    userId = user ? user._id : Meteor.userId(),
  }) {
    ResearchCollection.upsert({
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
      'research.total': 1,
    });
  }
}

export default Research;
