import { Meteor } from 'meteor/meteor';
import { Job } from '/moduls/game/lib/jobs';
import createGroup from '/moduls/battle/lib/imports/createGroup';
import Battle from '/moduls/battle/server/battle';

import Space from '../lib/space';
import Lib from '../lib/battle';
import battleDelay from './battleDelay';
import Config from './config';

const add = function({ userArmy, enemyArmy, data }) {
  const job = new Job(Space.jobs, Lib.EVENT_TYPE, data);
  job
    .retry(Config.JOBS.retries)
    .delay(battleDelay({ userArmy, enemyArmy }))
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

    if (data.planetId) {
      options.planetId = data.planetId;
    } else if (data.fleetId) {
      options.fleetId = data.fleetId;
    }

    if (data.targetHex) {
      options.hex = data.targetHex;
    }

    const battle = Battle.create(options,
      {
        [username]: [userGroup],
      },
      {
        ai: [enemyGroup],
      },
    );

    add({
      userArmy,
      enemyArmy,
      data: {
        ...data,
        battleId: battle.id,
      },
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
