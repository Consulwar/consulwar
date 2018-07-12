import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import './CosmosFleetPopup.html';
import './CosmosFleetPopup.styl';

class CosmosFleetPopup extends BlazeComponent {
  template() {
    return 'CosmosFleetPopup';
  }

  constructor({
    hash: {
      ship,
      spaceEvent,
      allowActions,
      position,
      isTooltip = false,
    },
  }) {
    super();

    this.ship = ship;
    this.spaceEvent = spaceEvent;
    this.allowActions = allowActions;
    this.position = position;
    this.isTooltip = isTooltip;
  }

  getTimeLeft() {
    const currentTime = Game.getCurrentServerTime();
    const afterEventTime = Game.dateToTime(this.spaceEvent.after);
    if (this.spaceEvent) {
      return afterEventTime - currentTime;
    }
    return 0;
  }

  getReptilesFleetPower() {
    return Game.Cosmos.reptilesFleetPower(this.ship.units);
  }

  attack(shipId = this.ship.id) {
    console.log(shipId);
    if (shipId) {
      Game.Cosmos.showAttackMenu(shipId);
    }
  }
}

CosmosFleetPopup.register('CosmosFleetPopup');

export default CosmosFleetPopup;
