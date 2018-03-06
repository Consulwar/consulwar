import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Blaze } from 'meteor/blaze';
import '/imports/client/ui/blocks/Unit/Units.styl';
import './UnitCharacteristics.html';
import './UnitCharacteristics.styl';

class UnitCharacteristics extends BlazeComponent {
  template() {
    return 'UnitCharacteristics';
  }

  showWeaponTooltip(event) {
    const target = $(event.currentTarget);
    const currentCharachteristic = target.attr('data-type') === 'weapon' ? 'damage' : 'life';
    const tooltip = Blaze._globalHelpers.militaryTooltip(
      this.data().unit.characteristics,
      currentCharachteristic,
    );
    target.attr('data-tooltip', tooltip['data-tooltip']);
  }

  showUnitTooltip(event, unitEl) {
    $(event.currentTarget).attr('data-tooltip', Blaze.toHTMLWithData(
      UnitCharacteristics.renderComponent(), {
        unit: unitEl,
        addTitle: true,
      }),
    );
  }

  // 'mouseover .targets > li': function(e, t) {
  // }
}

UnitCharacteristics.register('UnitCharacteristics');

export default UnitCharacteristics;
