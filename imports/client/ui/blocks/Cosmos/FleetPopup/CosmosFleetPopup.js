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
      isMapView = false,
    },
  }) {
    super();

    this.ship = ship;
    this.spaceEvent = spaceEvent;
    this.allowActions = allowActions;
    this.position = position;
    this.isMapView = isMapView;
  }

  onRendered() {
    super.onRendered();

    this.autorun(function() {
      if (!this.spaceEvent) {
        Game.Cosmos.hidePlanetPopup();
      }
    });
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

  attack(event, shipId = this.ship.id) {
    event.preventDefault();
    if (shipId) {
      Game.Cosmos.showAttackMenu(shipId);
    }
  }
}

CosmosFleetPopup.register('CosmosFleetPopup');

export default CosmosFleetPopup;
