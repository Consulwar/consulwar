import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Blaze } from 'meteor/blaze';
import { militaryTooltip } from '/moduls/game/client/helper';
import './UnitCharacteristics.html';
import './UnitCharacteristics.styl';

class UnitCharacteristics extends BlazeComponent {
  template() {
    return 'UnitCharacteristics';
  }

  constructor({
    hash: {
      unit,
      addTitle = false,
    },
  }) {
    super();
    this.unit = unit;
    this.addTitle = addTitle;
  }

  showCharacteristicsTooltip(event) {
    const target = $(event.currentTarget);
    const currentCharachteristic = target.attr('data-type') === 'weapon' ? 'damage' : 'life';
    const tooltip = militaryTooltip(
      this.unit.getCharacteristics(),
      currentCharachteristic,
    );
    target.attr({
      'data-tooltip-direction': 'w',
      'data-tooltip': tooltip['data-tooltip'],
    });
  }

  showUnitTooltip(event, unitEl) {
    $(event.currentTarget).attr({
      'data-tooltip':
      (new UnitCharacteristics({
        hash: {
          unit: unitEl,
          addTitle: true,
        },
      }).renderComponentToHTML()),
      'data-tooltip-direction': 's',
    });
  }

  getUnitChars(charsList) {
    const unitChars = this.unit.getCharacteristics();
    if (charsList === 'weapon.damage') {
      return (unitChars.weapon.damage.max + unitChars.weapon.damage.min) / 2;
    }
    const chars = charsList.split('.');
    return unitChars[chars[0]][chars[1]];
  }
}

UnitCharacteristics.register('UnitCharacteristics');

export default UnitCharacteristics;
