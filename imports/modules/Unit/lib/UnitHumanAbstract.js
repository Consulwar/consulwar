import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import User from '/imports/modules/User/lib/User';
import BattleCollection from '/moduls/battle/lib/imports/collection';
import Battle from '/moduls/battle/lib/imports/battle';
import UnitCollection from './UnitCollection';
import UnitAbstract from './UnitAbstract';

let Game;
Meteor.startup(() => {
  // Temporary hack to avoid circular dependency
  // Must be changed to imports after
  // House, Cards, Achievements will be separate modules
  // eslint-disable-next-line global-require
  Game = require('/moduls/game/lib/main.game').default;
});

class UnitHumanAbstract extends UnitAbstract {
  constructor({
    decayTime,
    maxCount,
    ...options
  }) {
    super({ ...options });

    this.type = 'unit';

    this.decayTime = decayTime;
    this.maxCount = maxCount;
  }

  getCount({
    from = (this.group === 'Ground' ? 'hangar' : 'space'),
    ...options
  } = {}) {
    let record;
    if (from === 'hangar') {
      record = Game.Unit.getHangarArmy(options);
    } else {
      record = Game.Unit.getHomeFleetArmy(options);
    }

    return (record && record.units && record.units[this.id]) || 0;
  }

  getTotalCount({
    userId,
    user = User.getById({ userId: userId || Meteor.userId() }),
  } = {}) {
    const armies = UnitCollection.find({ user_id: user._id }).fetch() || [];

    let result = 0;

    armies.forEach((army) => {
      if (army.units
        && army.units[this.id]
      ) {
        result += army.units[this.id];
      }
    });

    if (this.group === 'Ground') {
      const earthUnits = Game.EarthUnits.get(user._id);
      if (earthUnits) {
        Object.entries(earthUnits.userArmy).forEach(([unitId, count]) => {
          if (this.id === unitId) {
            result += count;
          }
        });
      }
    }

    const battles = BattleCollection.find({
      status: Battle.Status.progress,
      userNames: user.username,
    }).fetch() || [];

    battles.forEach((battle) => {
      battle.currentUnits[Battle.USER_SIDE][user.username].forEach((units) => {
        _(units).pairs().forEach(([id, { count }]) => {
          if (this.id === id) {
            result += count;
          }
        });
      });
    });

    return result;
  }
}

export default UnitHumanAbstract;
