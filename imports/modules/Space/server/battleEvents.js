import { Meteor } from 'meteor/meteor';
import { Job } from '/moduls/game/lib/jobs';
import createGroup from '/moduls/battle/lib/imports/createGroup';
import Battle from '/moduls/battle/server/battle';
import Game from '/moduls/game/lib/main.game';

import Space from '../lib/space';
import Lib from '../lib/battle';
import battleDelay from './battleDelay';
import Config from './config';

const add = function({
  userArmy,
  enemyArmy,
  data,
  delay = battleDelay({ userArmy, enemyArmy }),
}) {
  const job = new Job(Space.jobs, Lib.EVENT_TYPE, data);
  job
    .retry({
      retries: Config.JOBS.retry.retries,
      wait: Config.JOBS.retry.wait,
    })
    .delay(delay)
    .save();
};

export default {
  ...Lib,

  createBattleAndAdd({
    username,
    userArmy,
    enemyArmy,
    data,
    mission,
    userId = Meteor.users.findOne({ username })._id,
    userGroup = createGroup({ army: userArmy, userId }),
    enemyGroup = createGroup({ army: enemyArmy, userId }),
  }) {
    const options = {
      missionType: mission.type,
      missionLevel: mission.level,
    };

    if (data.noReward) {
      options.noReward = data.noReward;
    }

    if (data.planetId) {
      options.planetId = data.planetId;
    } else if (data.fleetId) {
      options.fleetId = data.fleetId;
    }

    if (data.targetHex) {
      options.hex = data.targetHex;
    }

    const battle = Battle.create(
      options,
      {
        [username]: [userGroup],
      },
      {
        ai: [enemyGroup],
      },
    );

    const delay = Game.Battle.items[mission.type].firstRoundDuration;
    add({
      userArmy,
      enemyArmy,
      data: {
        ...data,
        battleId: battle.id,
      },
      delay,
    });
  },

  findByPlanetId(planetId) {
    return Space.collection.findOne({
      type: Lib.EVENT_TYPE,
      'data.planetId': planetId,
      status: Space.filterActive,
    });
  },

  findByFleetId(fleetId) {
    return Space.collection.findOne({
      type: Lib.EVENT_TYPE,
      'data.fleetId': fleetId,
      status: Space.filterActive,
    });
  },
};
