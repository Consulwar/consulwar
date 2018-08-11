import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import { later } from 'meteor/mrt:later'; // eslint-disable-line
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/blocks/Units/Units';
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
    const addArmyItems = (army) => {
      const result = [];
      _.forEach(army, (count, id) => {
        const obj = {
          id,
          count,
        };
        result.push(obj);
      });
      return result;
    };

    return [
      {
        title: 'Рептилии',
        isReptiles: true,
        colorClass: 'cw--color_honor',
        list: addArmyItems(this.reptiles),
      },
      {
        title: 'Армия Консулов',
        colorClass: 'cw--color_metal',
        list: addArmyItems(this.humans),
        myArmy: addArmyItems(this.getMyArmy()),
      },
    ];
  }
}

EarthBattle.register('EarthBattle');

export default EarthBattle;
