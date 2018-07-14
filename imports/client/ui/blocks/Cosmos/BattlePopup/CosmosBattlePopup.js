import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import Space from '/imports/modules/Space/client/space';
import './CosmosBattlePopup.html';
import './CosmosBattlePopup.styl';

class CosmosBattlePopup extends BlazeComponent {
  template() {
    return 'CosmosBattlePopup';
  }
  constructor({
    hash: {
      battleId,
      position,
    },
  }) {
    super();

    this.battleId = battleId;
    this.position = position;
  }

  info() {
    const battleEvent = Space.collection.findOne({
      'data.battleId': this.battleId,
    });
    if (!battleEvent) {
      return null;
    }

    const currentTime = Game.getCurrentServerTime();
    const secondsLeft = Math.ceil((battleEvent.after - (currentTime * 1000)) / 1000);
    const round = battleEvent.repeated + 1;

    return {
      round,
      secondsLeft,
    };
  }

  send(event, battleId = this.battleId) {
    if (battleId) {
      Game.Cosmos.showAttackMenu(battleId);
    }
  }
}

CosmosBattlePopup.register('CosmosBattlePopup');

export default CosmosBattlePopup;
