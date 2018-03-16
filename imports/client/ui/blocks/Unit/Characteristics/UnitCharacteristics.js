import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
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
    this.unitChars = unit.getCharacteristics();
  }

  showCharacteristicsTooltip(event, type) {
    const target = $(event.currentTarget);
    let tooltip = {};
    if (type === 'damage' || type === 'life') {
      tooltip = militaryTooltip(
        this.unit.getCharacteristics(),
        type,
      );
    } else if (type === 'weapon.signature') {
      tooltip = {
        'data-tooltip': `<div style="width:300px">
            <b>Сигнатура орудия</b> (радиус поражения). Наносит максимальный урон (100%) по цели с такой же или большей сигнатурой брони. Чем меньше сигнатура брони у цели, тем меньше урона получит цель. Например, юнит с сигнатурой орудия, вдвое большей, чем сигнатура брони противника, нанесёт всего 50% урона.
          </div>`,
        'data-tooltip-direction': 's',
      };
    } else if (type === 'health.signature') {
      tooltip = {
        'data-tooltip': `<div style="width:300px">
            <b>Сигнатура брони</b> (защитные экраны). Получает максимум урона (100%) от противника с такой же или меньшей сигнатурой орудий. Чем больше сигнатура орудий у противника, тем меньше урона получит юнит. Например, юнит с сигнатурой брони, вдвое меньшей, чем сигнатура орудия противника, получит всего 50% урона.
          </div>`,
        'data-tooltip-direction': 's',
      };
    }
    target.attr({
      'data-tooltip-direction': tooltip['data-tooltip-direction'] || 'w',
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
    if (charsList === 'weapon.damage') {
      return (this.unitChars.weapon.damage.max + this.unitChars.weapon.damage.min) / 2;
    }
    const chars = charsList.split('.');
    return this.unitChars[chars[0]][chars[1]];
  }
}

UnitCharacteristics.register('UnitCharacteristics');

export default UnitCharacteristics;
