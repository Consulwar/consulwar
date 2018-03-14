import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import { Notifications } from '/moduls/game/lib/importCompability';
import '/imports/client/ui/button/button.styl';
import './UnitRepair.html';
import './UnitRepair.styl';

class UnitRepair extends BlazeComponent {
  template() {
    return 'UnitRepair';
  }

  constructor({
    hash: {
      unit,
    },
  }) {
    super();

    this.unit = unit;
    this.unitsCount = this.getWrecksCount(this.unit);
  }

  getWrecksCount(unit) {
    const wrecks = Game.Wrecks.Collection.find({
      userId: Meteor.userId(),
    }).fetch()[0];

    return (
      wrecks
      && wrecks.units
      && wrecks.units[unit.id]
      && wrecks.units[unit.id].count
    ) || 0;
  }

  getPrice() {
    return Game.Wrecks.getPrice(this.unit, this.unitsCount);
  }

  repair() {
    Meteor.call('unit.repair', this.unit.id, (error) => {
      if (error) {
        Notifications.error('Невозможно восстановить юнитов', error.error);
      } else {
        this.removeComponent();
        Notifications.success('Юниты восстановлены');
      }
    });
  }
}

UnitRepair.register('UnitRepair');

export default UnitRepair;
