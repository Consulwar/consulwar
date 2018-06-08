import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Notifications } from '/moduls/game/lib/importCompability';
import { ReactiveVar } from 'meteor/reactive-var';
import armyHumansContent from '/imports/content/Unit/Human/Ground/client';
import Game from '/moduls/game/lib/main.game';
import './EarthReinforcement.html';
import './EarthReinforcement.styl';

class EarthReinforcement extends BlazeComponent {
  template() {
    return 'EarthReinforcement';
  }
  constructor({
    hash: {
      zoneName,
    },
  }) {
    super();
    this.zoneName = zoneName;

    this.honor = new ReactiveVar(0);
  }

  onCreated() {
    super.onCreated();

    this.units = [];
    this.updateUnits();

    this.autorun(() => {
      this.calculateHonor();
    });
  }

  updateUnits() {
    this.units = _.map(armyHumansContent, (unit, id) => {
      const { title, icon } = unit;
      const max = unit.getCurrentCount({ from: 'hangar' });
      const count = new ReactiveVar(0);

      return {
        id,
        title,
        icon,
        max,
        count,
      }
    });
  }

  getReserve(unit) {
    return (unit.max - unit.count.get());
  }

  toggleMaxCount(event, unit) {
    if (unit.max > 0) {
      const count = unit.count.get();
      if(count < unit.max) {
        unit.count.set(unit.max);
      } else {
        unit.count.set(0);
      }
    }
  }

  calculateHonor() {
    let honor = 0;
    (this.units).forEach((unit) => {
      const { id, max } = unit;
      let count = unit.count.get();
      if (count > max) {
        count = max;
      }
      if (count > 0) {
        const unitPrice = armyHumansContent[id].getBasePrice(count);
        honor += Game.Resources.calculateHonorFromReinforcement(unitPrice);
      }
    });

    this.honor.set(honor);
  }

  selectAllUnits() {
    (this.units).forEach((unit) => {
      const { max, count } = unit;
      if (max > 0) {
        count.set(max);
      }
    })
  }

  sendUnits() {
    let total = 0;
    const units = {};

    (this.units).forEach((unit) => {
      const { id, max } = unit;
      const count = unit.count.get();

      if (max > 0 && count > 0) {
        units[id] = Math.min(max, count);
        total += count;
      }

      unit.count.set(0);
    });

    if (total > 0) {
      Meteor.call(
        'earth.sendReinforcement',
        units,
        this.zoneName,
        (err) => {
          if (err) {
            Notifications.error('Не удалось отправить войска',err.error);
          } else {
            this.updateUnits();
            Notifications.success('Войска отправлены на Землю');
          }
        },
      );
    } else {
      Notifications.info('Выберите войска для отправки');
    }
  }
}

EarthReinforcement.register('EarthReinforcement');

export default EarthReinforcement;
