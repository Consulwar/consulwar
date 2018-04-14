import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import './Buffs.html';
import './Buffs.styl';

class Buffs extends BlazeComponent {
  template() {
    return 'Buffs';
  }

  getBonus() {
    const activeBonuses = Game.Cards.getActive();
    const bonusList = [];

    _.forEach(activeBonuses, (item) => {
      const bonus = {
        name: item.name,
        type: item.engName,
        time: (item.getActiveTask().finishTime - Game.getCurrentServerTime()),
      };

      if (item.effects.length > 1) {
        let tooltip = '';
        _.forEach(item.effects, (effectItem) => {
          tooltip += `${effectItem.textBefore}${effectItem.result()}${effectItem.textAfter}<br/>`;
        });
        bonus.tooltip = tooltip;
      } else {
        bonus.effect = item.effects;
        bonus.type = item.effects[0].affect.toString();
        bonus.tooltip = item.name;
      }

      bonusList.push(bonus);
    });

    return bonusList;
  }
}

Buffs.register('Buffs');

export default Buffs;
