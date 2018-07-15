import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import Space from '/imports/modules/Space/client/space';
import BattleEvents from '/imports/modules/Space/client/battleEvents';
import SpacePlanetPopup from '/imports/client/ui/blocks/Space/Planet/Popup/SpacePlanetPopup';
import './SpacePlanet.html';
import './SpacePlanet.styl';

class SpacePlanet extends BlazeComponent {
  template() {
    return 'SpacePlanet';
  }

  constructor({
    hash: {
      name,
      isDisabled,
      location,
      planet,
      isSelected,
      isTopTime,
      isCompact,
      className,
    },
  }) {
    super();

    this.planetName = name;
    this.planet = planet;
    this.isSelected = isSelected;
    this.isTopTime = isTopTime;
    this.isDisabled = isDisabled;
    this.location = location;
    this.isCompact = isCompact;
    this.className = className;
  }

  statusColony(planet = this.planet) {
    let status = null;
    if (planet.status === Game.Planets.STATUS.REPTILES) {
      status = 'reptile';
    }

    if (planet.status === Game.Planets.STATUS.HUMANS) {
      status = 'human';

      if (planet.minerUsername === Meteor.user().username) {
        status = 'user';
      } else {
        const alliance = Game.Alliance.Collection.findOne();
        if (
          alliance
          && alliance.participants.indexOf(planet.minerUsername) >= 0
        ) {
          status = 'ally';
        }
      }
    }
    return status;
  }

  statusFleet(planet = this.planet) {
    let status = null;
    if (planet.mission) {
      status = 'reptile';
    }

    if (planet.armyUsername) {
      status = 'human';

      if (planet.armyUsername === Meteor.user().username) {
        status = 'user';
      } else {
        const alliance = Game.Alliance.Collection.findOne();
        if (
          alliance
          && alliance.participants.indexOf(planet.armyUsername) >= 0
        ) {
          status = 'ally';
        }
      }
    }
    return status;
  }

  battleExists() {
    return this.planet._id && Space.collection.findOne({
      type: BattleEvents.EVENT_TYPE,
      status: Space.filterActive,
      'data.planetId': this.planet._id,
    });
  }

  getTimeNextDrop(timeCollected) {
    const currentTime = Game.getCurrentServerTime();
    const collectPeriod = Game.Cosmos.COLLECT_ARTEFACTS_PERIOD;
    const passed = (currentTime - timeCollected) % collectPeriod;
    return collectPeriod - passed;
  }

  showTooltip({ currentTarget }) {
    let tooltip = '';

    if (this.planet.isDisabled) {
      tooltip = 'Недоступна для выбора';
    } else if (this.planet.isEmpty) {
      if (this.isSent) {
        tooltip = 'Флот в полёте';
      } else {
        tooltip = 'Свободная колония';
      }
    } else if (this.planet.notAvaliable) {
      if (this.planet.canBuy) {
        tooltip = 'Можно купить';
      } else {
        tooltip = 'Доступна с повышением ранга';
      }
    } else {
      tooltip = new SpacePlanetPopup({
        hash: {
          drop: Game.Cosmos.getPlanetPopupInfo(this.planet),
          planet: this.planet,
          isTooltip: true,
        },
      }).renderComponentToHTML();
    }
    $(currentTarget).attr({
      'data-tooltip': tooltip,
      'data-tooltip-direction': 'e',
    });
  }
}

SpacePlanet.register('SpacePlanet');

export default SpacePlanet;
