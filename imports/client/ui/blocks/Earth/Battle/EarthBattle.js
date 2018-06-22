import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
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
  }

  getMyArmy() {
    if (this.isMyZone) {
      return Game.EarthUnits.get().userArmy;
    }
    return {};
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
