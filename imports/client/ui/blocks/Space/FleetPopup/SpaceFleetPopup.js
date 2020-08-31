import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import Game, { game } from '/moduls/game/lib/main.game';
import { Notifications } from '/moduls/game/lib/importCompability';
import systemUsername from '/moduls/user/lib/systemUsername';
import { Meteor } from 'meteor/meteor';
import FlightEvents from '/imports/modules/Space/client/flightEvents';
import humanSpaceUnits from '/imports/content/Unit/Human/Space/client';
import reptileSpaceUnits from '/imports/content/Unit/Reptile/Space/client';
import ConfigLib from '/imports/modules/Space/lib/config';
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
      spaceEvent,
      allowActions,
      position,
      isMapView = false,
    },
  }) {
    super();

    this.spaceEvent = spaceEvent;
    this.allowActions = allowActions;
    this.position = position;
    this.isMapView = isMapView;
    this.ship = this.getShipInfo(this.spaceEvent);
  }

  onRendered() {
    super.onRendered();

    this.autorun(function() {
      if (!this.spaceEvent) {
        Game.Cosmos.hidePlanetPopup();
      }
    });
  }


  getShipInfo(spaceEvent = this.spaceEvent) {
    if (
      !spaceEvent
      || spaceEvent.status === 'completed'
      || spaceEvent.status === 'cancelled'
    ) {
      return null;
    }

    const info = {};

    info.name = null;
    info.id = spaceEvent._id;
    info.canWithdraw = false;

    if (spaceEvent.data.isHumans) {
      info.isHumans = true;
      info.canSend = false;
      if (Meteor.user().username !== spaceEvent.data.username) {
        info.owner = spaceEvent.data.username;
      } else if (!spaceEvent.data.isBack) {
        info.canWithdraw = true;
      }

      if (spaceEvent.data.username === systemUsername) {
        info.status = info.owner;
        info.owner = false;
      }
    } else {
      const { level, type } = spaceEvent.data.mission;
      info.isHumans = false;
      info.canSend = true;
      info.mission = {
        level,
        name: Game.Battle.items[type].name,
        reward: Game.Battle.items[type].level[level].reward,
      };
      info.status = 'Флот Рептилий';
    }

    const units = FlightEvents.getFleetUnits(spaceEvent.data);
    if (units) {
      let unitsSource = null;
      if (spaceEvent.data.isHumans) {
        unitsSource = humanSpaceUnits;
      } else {
        unitsSource = reptileSpaceUnits;
      }

      info.units = [];

      _.toPairs(unitsSource).forEach(([id, unit]) => {
        const countId = units[id];

        let count = countId || 0;
        if (_.isString(countId)) {
          count = game.Battle.count[countId];
        }

        info.units.push({
          id,
          unit,
          count,
          countId,
        });
      });
    }

    return info;
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

  withdraw(event, shipId = this.ship.id) {
    event.preventDefault();
    if (shipId) {
      Game.showAcceptWindow(`Экстренный отзыв флота обойдётся в ${ConfigLib.WITHDRAW_PRICE} ГГК.`, () => {
        const userResources = Game.Resources.getValue();
        if (userResources.credits.amount < ConfigLib.WITHDRAW_PRICE) {
          Notifications.error('Недостаточно ГГК');
          return;
        }

        Meteor.call(
          'space.withdrawFleet',
          shipId,
          function(err) {
            if (err) {
              Notifications.error('Не удалось отозвать флот', err.error);
            } else {
              Notifications.success('Флот отозван');
            }
          },
        );
      });
    }
  }
}

SpaceFleetPopup.register('SpaceFleetPopup');

export default SpaceFleetPopup;
