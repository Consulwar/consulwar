import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import '/imports/client/ui/blocks/Units/Power/UnitsPower';
import './SpaceFleetPopup.html';
import './SpaceFleetPopup.styl';

class SpaceFleetPopup extends BlazeComponent {
  template() {
    return 'SpaceFleetPopup';
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

  getReptilesFleet() {
    return _.reduce(this.ship.units, (result, unit) => {
      const fleet = result;
      if (_.isString(unit.count)) {
        fleet[unit.id] = unit.countId;
      } else if (unit.count > 0) {
        fleet[unit.id] = unit.count;
      }
      return fleet;
    }, {});
  }

  attack(event, shipId = this.ship.id) {
    event.preventDefault();
    if (shipId) {
      Game.Cosmos.showAttackMenu(shipId);
    }
  }
}

SpaceFleetPopup.register('SpaceFleetPopup');

export default SpaceFleetPopup;
