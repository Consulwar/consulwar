import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import './Buffs.html';
import './Buffs.styl';

class Buffs extends BlazeComponent {
  template() {
    return 'Buffs';
  }

  getEffectObj(effect) {
    return {
      type: (effect.affect && effect.affect.toString()) || '',
      effectText: `${effect.textBefore}${effect.result()}${effect.textAfter}`,
    };
  }

  getBonus() {
    const activeBonuses = Game.Cards.getActive();
    const bonusList = [];

    _.forEach(activeBonuses, (item) => {
      const bonus = {
        name: item.name,
        type: item.engName,
        effectsHtml: '',
        hasMark: false,
      };

      const time = item.getActiveTask().finishTime - Game.getCurrentServerTime();
      bonus.time = Game.Helpers.formatSeconds(time);

      if (item.effects.length > 1) {
        _.forEach(item.effects, (effectItem) => {
          bonus.effectsHtml += `${this.getEffectObj(effectItem).effectText}<br/>`;
        });
      } else {
        bonus.name = this.getEffectObj(item.effects[0]).effectText;
        bonus.type = this.getEffectObj(item.effects[0]).type;
        bonus.hasMark = true;
      }

      const tooltipTemplate = _.template(`
        <div
          class="
            cw--Buffs__tooltipHeader
            cw--Buffs__tooltipHeader_<%- type %>
          "
        >
          <%- name %>
          <time class="cw--Buffs__timer">
            <%- time %>
          </time>
        </div>
        <div class="cw--Buffs__effects">
          <%= effectsHtml %>
        </div>
      `);

      bonus.tooltip = tooltipTemplate(bonus);

      bonusList.push(bonus);
    });

    return bonusList;
  }
}

Buffs.register('Buffs');

export default Buffs;
