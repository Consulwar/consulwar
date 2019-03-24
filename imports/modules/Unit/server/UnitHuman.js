import { Meteor } from 'meteor/meteor';
import createGroup from '/moduls/battle/lib/imports/createGroup';
import User from '/imports/modules/User/server/User';
import UnitHumanAbstract from '../lib/UnitHumanAbstract';

let Game;
let Battle;
let BattleEvents;
Meteor.startup(() => {
  // Temporary hack to avoid circular dependency
  // Must be changed to imports after
  // House, Cards, Achievements will be separate modules
  // eslint-disable-next-line global-require
  Game = require('/moduls/game/lib/main.game').default;
  // eslint-disable-next-line global-require
  Battle = require('/moduls/battle/server/battle').default;
  // eslint-disable-next-line global-require
  BattleEvents = require('/imports/modules/Space/server/battleEvents').default;
});

class UnitHuman extends UnitHumanAbstract {
  static set(
    unit,
    invertSign,
    uid = Meteor.userId(),
    location = Game.Unit.location.HOME,
    armyId,
  ) {
    const multiplier = invertSign === true ? -1 : 1;

    Game.Unit.initialize(User.getById({ userId: uid }));

    const inc = {};
    inc[`units.${unit.id}`] = parseInt(unit.count * multiplier, 10);

    let query = {
      user_id: uid,
      location,
    };

    if (armyId) {
      query = { _id: armyId };
    }

    Game.Unit.Collection.update(query, {
      $inc: inc,
    });

    return inc;
  }

  static add({
    unit,
    userId,
    user = Meteor.users.findOne({ _id: (userId || Meteor.userId()) }),
  }) {
    let location;
    const homePlanet = Game.Planets.getBase(userId);
    let armyId;

    if (
      unit.group === 'Ground' ||
      /* TODO: implement hangar UI before uncommenting this
      (user.settings && user.settings.options &&
      user.settings.options.moveCompletedUnitToHangar) || */
      (!homePlanet)
    ) {
      location = Game.Unit.location.HOME;
    } else {
      const battleEvent = BattleEvents.findByPlanetId(homePlanet._id);

      if (battleEvent) {
        const userGroup = createGroup({
          army: {
            [unit.id]: unit.count,
          },
          userId: user._id,
        });
        Battle.addGroup(
          battleEvent.data.battleId,
          Battle.USER_SIDE,
          user.username,
          userGroup,
        );
        return;
      }
      ({ armyId } = homePlanet);

      location = Game.Unit.location.PLANET;
    }

    UnitHuman.set(unit, false, user._id, location, armyId);
  }

  static remove(unit, uid) {
    UnitHuman.set(unit, true, uid);
  }

  add({ count, ...options }) {
    this.constructor.add({
      unit: {
        id: this.id,
        group: this.group,
        count,
      },
      ...options,
    });
  }

  complete({
    count,
    userId,
    user = User.getById({ userId: userId || Meteor.userId() }),
  }) {
    const increment = {};
    increment['units.build.total'] = count;
    increment[`units.build.${this.id}`] = count;
    Game.Statistic.incrementUser(user._id, increment);

    this.add({ count, user });
  }
}

export default UnitHuman;
