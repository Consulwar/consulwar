import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import { later } from 'meteor/mrt:later'; // eslint-disable-line
import armyHumans from '/imports/content/Unit/Human/Ground/client';
import armyReptiles from '/imports/content/Unit/Reptile/Ground/client';
import Game from '/moduls/game/lib/main.game';
import './EarthBattle.html';
import './EarthBattle.styl';

class EarthBattle extends BlazeComponent {
  template() {
    return 'EarthBattle';
  }

  constructor({
    hash: {
      isMyZone,
      reptiles,
      humans,
    },
  }) {
    super();

    this.reptiles = reptiles;
    this.humans = humans;
    this.isMyZone = isMyZone;

    const updateScheduleTimeConfig = Game.Earth.UPDATE_SCHEDULE;
    const updateScheduleTime = later.parse.text(updateScheduleTimeConfig).schedules[0].t[0];
    this.updateScheduleDate = new Date(updateScheduleTime * 1000);
  }

  getMyArmy() {
    if (this.isMyZone) {
      return Game.EarthUnits.get().userArmy;
    }
    return {};
  }

  timeNextRound() {
    const nextRunHours = this.updateScheduleDate.getHours();
    const nextRunMinutes = this.updateScheduleDate.getMinutes();

    const serverTime = Game.getCurrentServerTime() * 1000;
    const currentDate = new Date(serverTime);

    const nextDate = new Date(serverTime);
    nextDate.setHours(nextRunHours);
    nextDate.setMinutes(nextRunMinutes);
    nextDate.setSeconds(0);
    if (currentDate.getHours() >= nextRunHours) {
      nextDate.setDate(currentDate.getDate() + 1);
    }
    return (nextDate.getTime() - serverTime) / 1000;
  }

  battleList() {
    const myArmy = this.getMyArmy();

    const addArmyItems = (army, contentSource) => {
      const result = [];
      _.forEach(army, (count, id) => {
        const obj = {
          name: contentSource[id].title,
          count,
          myArmyCount: myArmy[id],
        };
        result.push(obj);
      });
      return result;
    };

    return [
      {
        title: 'Рептилии',
        colorClass: 'cw--color_honor',
        list: addArmyItems(this.reptiles, armyReptiles),
      },
      {
        title: 'Армия Консулов',
        colorClass: 'cw--color_metal',
        list: addArmyItems(this.humans, armyHumans),
      },
    ];
  }
}

EarthBattle.register('EarthBattle');

export default EarthBattle;
