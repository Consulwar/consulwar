import { Meteor } from 'meteor/meteor';
import BattleCollection from '/moduls/battle/lib/imports/collection';
import Battle from '/moduls/battle/lib/imports/battle';
import BuildingCollection from '/imports/modules/Building/lib/BuildingCollection';
import ResearchCollection from '/imports/modules/Research/lib/ResearchCollection';
import ContainerCollection from '/imports/modules/Container/lib/collection';
import SpaceHexCollection from '/imports/modules/MutualSpace/lib/collection';

import LibUser from '../lib/User';

let Game;
let evict;
let battleEvents;
let Space;
let DoomsDayGun;
Meteor.startup(() => {
  // Temporary hack to avoid circular dependency
  // Must be changed to imports after
  // House, Cards, Achievements will be separate modules
  // eslint-disable-next-line global-require
  Game = require('/moduls/game/lib/main.game').default;
  // eslint-disable-next-line global-require
  evict = require('/imports/modules/MutualSpace/server/eviction').default;
  // eslint-disable-next-line global-require
  battleEvents = require('/imports/modules/Space/server/battleEvents').default;
  // eslint-disable-next-line global-require
  Space = require('/imports/modules/Space/lib/space').default;
  // eslint-disable-next-line global-require
  DoomsDayGun = require('/imports/content/Unit/Human/Defense/server/DoomsDayGun');
});

class User extends LibUser {
  static checkAuth({ user } = {}) {
    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }
  }

  static canSelfVaip({ user } = {}) {
    const hex = SpaceHexCollection.findOne({ username: user.username });
    const hexDB = { x: hex.x, z: hex.z };

    const hasBattle = Space.collection.findOne({
      type: battleEvents.EVENT_TYPE,
      status: Space.filterActive,
      'data.targetHex.x': hexDB.x,
      'data.targetHex.z': hexDB.z,
    });

    if (hasBattle) {
      return false;
    }

    const inBattle = BattleCollection.findOne({
      'options.isEarth': { $exists: false },
      userNames: user.username,
      status: Battle.Status.progress,
    });

    if (inBattle) {
      return false;
    }

    return true;
  }

  static selfVaip({ user } = {}) {
    if (!user) {
      throw new Meteor.Error('Требуется пользователь');
    }

    if (!User.canSelfVaip({ user })) {
      throw new Meteor.Error('Нельзя');
    }

    // Cancel all jobs
    Space.collection.update({
      status: Space.filterActive,
      'data.username': user.username,
    }, {
      $set: {
        status: 'cancelled',
        cancelledBy: user.username,
      },
    }, {
      multi: true,
    });


    // Remove all buildings
    BuildingCollection.remove({
      user_id: user._id,
    });

    // Remove all researches
    ResearchCollection.remove({
      user_id: user._id,
    });

    // Remove all containers
    ContainerCollection.remove({
      userId: user._id,
    });

    // Cancel all battles in user hex & evict user from mutual space
    evict(user.username);

    // DELETE SPACE and create new one
    Game.Planets.Collection.remove({
      username: user.username,
    });
    Game.Planets.initialize(user);

    // Remove everything from queue
    Game.Queue.Collection.update({
      user_id: user._id,
      status: {
        $in: [
          Game.Queue.status.INCOMPLETE,
          Game.Queue.status.INPROGRESS,
        ],
      },
    }, {
      $set: {
        status: Game.Queue.status.DONE,
      },
    }, {
      multi: true,
    });

    // Remove all units
    Game.Unit.Collection.remove({
      user_id: user._id,
    });

    // Remove all wrecks
    Game.Wrecks.Collection.remove({
      userId: user._id,
    });

    // Remove resources except credits, ruby plasmoids and cleancredits
    const resources = Game.Resources.Collection.findOne({
      user_id: user._id,
    });

    Game.Resources.Collection.remove({
      user_id: user._id,
    });

    const creditsAmount = (resources.credits && resources.credits.amount) || 0;
    const rubyPlasmoidAmount = Math.min(
      (resources.ruby_plasmoid && resources.ruby_plasmoid.amount) || 0,
      (DoomsDayGun.getPrice().ruby_plasmoid / 2) + 50,
    );
    const cleanCreditAmount = (resources.cleancredit && resources.cleancredit.amount) || 0;
    Game.Resources.Collection.insert({
      _id: resources._id,
      user_id: user._id,
      humans: { amount: 0 },
      metals: { amount: 0 },
      crystals: { amount: 0 },
      credits: { amount: creditsAmount },
      honor: { amount: 0 },
      ruby_plasmoid: { amount: rubyPlasmoidAmount },
      cleancredit: { amount: cleanCreditAmount },
      updated: Game.getCurrentTime(),
    });

    // user.ratingMultiplier
    Meteor.users.update({
      _id: user._id,
    }, {
      $set: {
        rating: -1,
        ratingMultiplier: (user.ratingMultiplier || 1) * 2,
      },
    });
  }
}

export default User;
