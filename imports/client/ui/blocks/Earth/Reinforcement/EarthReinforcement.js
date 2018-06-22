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

    this.units = this.getUnits();

    this.autorun(() => {
      this.calculateHonor();
    });
  }

  getUnits() {
    return _.map(armyHumansContent, (unit, id) => {
      const { title, icon } = unit;
      const hangarUnits = unit.getCurrentCount({ from: 'hangar' });
      const max = new ReactiveVar(hangarUnits);
      const count = new ReactiveVar(0);

      return {
        id,
        title,
        icon,
        max,
        count,
      };
    });
  }

  updateUnits() {
    (this.units).forEach((unit) => {
      const hangarUnits = armyHumansContent[unit.id].getCurrentCount({ from: 'hangar' });
      unit.max.set(hangarUnits);
      unit.count.set(0);
    });
  }

  toggleMaxCount(event, unit) {
    const max = unit.max.get();
    if (max > 0) {
      const count = unit.count.get();
      if (count < max) {
        unit.count.set(max);
      } else {
        unit.count.set(0);
      }
    }
  }

  calculateHonor() {
    let honor = 0;
    (this.units).forEach((unit) => {
      const { id } = unit;
      const max = unit.max.get();
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
      if (max.get() > 0) {
        count.set(max.get());
      }
    });
  }

  sendUnits() {
    let total = 0;
    const units = {};

    (this.units).forEach((unit) => {
      const { id } = unit;
      const max = unit.max.get();
      const count = unit.count.get();

      if (max > 0 && count > 0) {
        units[id] = Math.min(max, count);
        total += count;
      }
    });

    if (total > 0) {
      Meteor.call(
        'earth.sendReinforcement',
        units,
        this.zoneName,
        (err) => {
          if (err) {
            Notifications.error(
              'Не удалось отправить войска',
              err.error,
            );
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
