import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import Game, { game } from '/moduls/game/lib/main.game';
import './UnitsPower.html';
import './UnitsPower.styl';

class UnitsPower extends BlazeComponent {
  template() {
    return 'UnitsPower';
  }

  constructor({
    hash: {
      units,
      className,
    },
  }) {
    super();

    this.className = className;
    this.units = units;
  }

  getPower() {
    const units = _.reduce(this.units, (result, unitCount, id) => {
      const fleet = result;
      let count = unitCount;
      if (_.isString(unitCount)) {
        count = game.Battle.countNumber[unitCount].max;
      }

      if (count > 0) {
        fleet[id] = count;
      }

      return fleet;
    }, {});

    return Game.Unit.calculateUnitsPower(units);
  }
}

UnitsPower.register('UnitsPower');

export default UnitsPower;
