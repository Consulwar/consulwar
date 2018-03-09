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

  showWeaponTooltip(event) {
    const target = $(event.currentTarget);
    const currentCharachteristic = target.attr('data-type') === 'weapon' ? 'damage' : 'life';
    const tooltip = militaryTooltip(
      this.data().unit.getCharacteristics(),
      currentCharachteristic,
    );
    target.attr('data-tooltip', tooltip['data-tooltip']);
  }

  showUnitTooltip(event, unitEl) {
    $(event.currentTarget).attr(
      'data-tooltip',
      Blaze.toHTMLWithData(
        UnitCharacteristics.renderComponent(),
        {
          unit: unitEl,
          addTitle: true,
        },
      ),
    );
  }
}

UnitCharacteristics.register('UnitCharacteristics');

export default UnitCharacteristics;
