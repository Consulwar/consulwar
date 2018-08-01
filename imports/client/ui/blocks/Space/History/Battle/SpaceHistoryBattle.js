import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import '/imports/client/ui/blocks/Units/Power/UnitsPower';
import '/imports/client/ui/blocks/Units/Units';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import './SpaceHistoryBattle.html';
import './SpaceHistoryBattle.styl';

class SpaceHistoryBattle extends BlazeComponent {
  template() {
    return 'SpaceHistoryBattle';
  }

  constructor({
    hash: {
      battle,
    },
  }) {
    super();

    this.battle = battle;
  }

  onCreated() {
    super.onCreated();

    this.userName = Meteor.user().username;
    this.userUnits = this.getUnits('userUnits', false);
    this.userLostUnits = this.getUnits('userUnits', true);
    this.enemyUnits = this.getUnits('enemyUnits', false);
    this.enemyLostUnits = this.getUnits('enemyUnits', true);
  }

  isSpace() {
    return !this.battle.isEarth;
  }

  getUnits(unitsType, isDiff = false) {
    const units = this.battle[unitsType];
    const resultUnits = [];

    units.forEach((unit) => {
      let count = unit.start;
      if (isDiff) {
        count = unit.end - unit.start;
      }
      if (count !== 0) {
        resultUnits.push({
          id: unit.id,
          count,
        });
      }
    });
    if (resultUnits.length <= 0) {
      return false;
    }
    return resultUnits;
  }

  getRawUnits(unitsType) {
    // for calculate Power
    const units = this.battle[unitsType];
    const result = {};

    units.forEach((unit) => {
      result[unit.id] = unit.start;
    });
    return result;
  }
}

SpaceHistoryBattle.register('SpaceHistoryBattle');

export default SpaceHistoryBattle;
