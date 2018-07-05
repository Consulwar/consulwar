import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import armyHumans from '/imports/content/Unit/Human/Ground/client';
import armyReptiles from '/imports/content/Unit/Reptile/Ground/client';
import fleetHumans from '/imports/content/Unit/Human/Space/client';
import fleetReptiles from '/imports/content/Unit/Reptile/Space/client';
import UnitPopup from '/imports/client/ui/blocks/Unit/Popup/UnitPopup';
import './Units.html';
import './Units.styl';

class Units extends BlazeComponent {
  template() {
    return 'Units';
  }

  constructor({
    hash: {
      isReptiles,
      isSpace = false,
      units = {},
      userArmy = {},
    },
  }) {
    super();

    this.units = units;
    this.userArmy = userArmy;
    this.isSpace = isSpace;
    this.isReptiles = isReptiles;
  }

  isTextUnits() {
    // is user setting "text units on map" turned on
    const options = Meteor.user().settings && Meteor.user().settings.options;

    return options && options.textUnits;
  }

  getUnits() {
    if (this.isSpace) {
      if (this.isReptiles) {
        return fleetReptiles;
      }
      return fleetHumans;
    }
    if (this.isReptiles) {
      return armyReptiles;
    }
    return armyHumans;
  }

  getArmy() {
    const armyContent = this.getUnits();

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

      if (this.isTextUnits() && !count) {
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

    const unit = this.getUnits(unitId)[unitId];
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
