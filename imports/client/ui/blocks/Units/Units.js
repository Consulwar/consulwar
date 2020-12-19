import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import armyHumans from '/imports/content/Unit/Human/Ground/client';
import armyReptiles from '/imports/content/Unit/Reptile/Ground/client';
import fleetHumans from '/imports/content/Unit/Human/Space/client';
import fleetReptiles from '/imports/content/Unit/Reptile/Space/client';
import defenseUnits from '/imports/content/Unit/Human/Defense/client';
import UnitPopup from '/imports/client/ui/blocks/Unit/Popup/UnitPopup';
import './Units.html';
import './Units.styl';

class Units extends BlazeComponent {
  template() {
    return 'Units';
  }

  constructor({
    hash: {
      units = [],
      userArmy = [],
      isShowDefense = false,
      isHideNull = false,
      isReptiles,
      isBattleUnits = false,
      isSpace = false,
      className,
    },
  }) {
    super();

    this.units = units;
    this.userArmy = userArmy;
    this.isShowDefense = isShowDefense;
    this.isHideNull = isHideNull;
    this.isReptiles = isReptiles;
    this.isBattleUnits = isBattleUnits;
    this.isSpace = isSpace;
    this.className = className;
  }

  isTextUnits() {
    // is user setting "text units on map" turned on
    const options = Meteor.user().settings && Meteor.user().settings.options;

    return options && options.textUnits;
  }

  getSourceUnits() {
    if (this.isSpace) {
      if (this.isReptiles) {
        if (this.isReptiles.name === 'Крампус') {
          return _.pick(
            fleetReptiles,
            'Unit/Reptile/Space/Krampus',
          );
        } else if (this.isReptiles.name === 'Крампусси') {
          return _.pick(
            fleetReptiles,
            'Unit/Reptile/Space/Krampussy',
          );
        }
        return _.omit(
          fleetReptiles,
          [
            'Unit/Reptile/Space/Krampus',
            'Unit/Reptile/Space/Krampussy',
          ],
        );
      }
      if (this.isShowDefense) {
        return _.merge({}, defenseUnits, fleetHumans);
      }
      return fleetHumans;
    }
    if (this.isReptiles) {
      return armyReptiles;
    }
    return armyHumans;
  }

  getKrampus() {
    return this.getArmy()[0];
  }

  getArmy() {
    const armyContent = this.getSourceUnits();

    // format units to { id: { count, countId } }
    const units = {};
    _.forEach(this.units, (unit) => {
      units[unit.id] = {
        count: unit.count,
        countId: unit.countId,
      };
    });

    // format userArmy to { id:count }
    const userArmy = {};
    if (this.userArmy) {
      _.forEach(this.userArmy, (unit) => {
        userArmy[unit.id] = unit.count;
      });
    }

    return _.map(armyContent, (item) => {
      const { id, title, icon } = item;
      const url = item.url ? item.url() : null;
      const count = (units[id] && units[id].count) || 0;
      const countId = (units[id] && units[id].countId) || 0;
      const myArmy = userArmy[id] || 0;

      if ((this.isTextUnits() || this.isHideNull) && !count) {
        return false;
      }

      return {
        id,
        title,
        icon,
        count,
        countId,
        myArmy,
        url,
      };
    });
  }

  showUnit(event, unitId) {
    event.stopPropagation();

    const unit = this.getSourceUnits(unitId)[unitId];
    if (unit.type === 'reptileUnit') {
      event.preventDefault();

      Game.Popup.show({
        template: (new UnitPopup({
          hash: {
            unit,
          },
        })).renderComponent(),
        hideClose: true,
      });
    }
  }
}

Units.register('Units');

export default Units;
