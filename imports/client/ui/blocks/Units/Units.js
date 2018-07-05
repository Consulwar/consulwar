import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import armyHumans from '/imports/content/Unit/Human/Ground/client';
import armyReptiles from '/imports/content/Unit/Reptile/Ground/client';
import UnitPopup from '/imports/client/ui/blocks/Unit/Popup/UnitPopup';
import './EarthArmy.html';
import './EarthArmy.styl';

class EarthArmy extends BlazeComponent {
  template() {
    return 'EarthArmy';
  }

  constructor({
    hash: {
      army = {},
      userArmy = {},
    },
  }) {
    super();

    this.army = army;
    this.userArmy = userArmy;
  }

  getUnits(id) {
    if (_.includes(_.keys(armyHumans), id)) {
      return armyHumans;
    }
    return armyReptiles;
  }

  getArmy() {
    const armyContent = this.getUnits(_.keys(this.army)[0]);

    return _.map(armyContent, (item) => {
      const { id, title, icon } = item;
      const count = this.army[id] || 0;
      const myArmy = this.userArmy[id] || 0;
      return {
        id,
        title,
        icon,
        count,
        myArmy,
      };
    });
  }

  showUnit(event, unitId) {
    event.stopPropagation();

    const unit = this.getUnits(unitId)[unitId];
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

EarthArmy.register('EarthArmy');

export default EarthArmy;
