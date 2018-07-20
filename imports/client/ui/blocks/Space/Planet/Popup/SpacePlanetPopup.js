import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Notifications } from '/moduls/game/lib/importCompability';
import Game, { game } from '/moduls/game/lib/main.game';
import { Meteor } from 'meteor/meteor';
import { _ } from 'lodash';
import humanSpaceUnits from '/imports/content/Unit/Human/Space/client';
import reptileSpaceUnits from '/imports/content/Unit/Reptile/Space/client';
import '/imports/client/ui/blocks/Units/Units';
import '/imports/client/ui/button/button.styl';
import './SpacePlanetPopup.html';
import './SpacePlanetPopup.styl';

class SpacePlanetPopup extends BlazeComponent {
  template() {
    return 'SpacePlanetPopup';
  }

  constructor({
    hash: {
      planet,
      allowActions,
      allowEdit,
      position,
      isMapView = false,
    },
  }) {
    super();

    this.planet = planet;
    this.planetInfo = this.getPlanetInfo(this.planet);
    this.drop = this.getPlanetDrop(this.planet);

    this.isMapView = isMapView;
    this.position = position;
    this.allowActions = allowActions;
    this.allowEdit = allowEdit;
  }

  getPlanetInfo(planet = this.planet) {
    if (!planet) {
      return null;
    }

    const info = {};

    info.name = planet.name;
    info.type = Game.Planets.types[planet.type].name;

    if (
      planet.isHome
      || planet.armyId
      || planet.status === Game.Planets.STATUS.HUMANS
    ) {
      info.isHumans = true;
      info.isHome = true;
      const user = Meteor.user();

      switch (planet.status) {
        case Game.Planets.STATUS.HUMANS:
          if (user.username !== planet.minerUsername) {
            info.title = (planet.isHome) ? 'Планета консула' : 'Колония консула';
          } else {
            info.title = (planet.isHome) ? 'Наша планета' : 'Наша колония';
          }
          break;
        case Game.Planets.STATUS.REPTILES:
          info.title = 'Планета рептилий';
          break;
        default:
          // Game.Planets.STATUS.NOBODY
          info.title = 'Свободная планета';
          break;
      }

      if (user.username !== planet.minerUsername) {
        info.owner = planet.minerUsername;
      }

      if (
        user.username !== planet.armyUsername
        && planet.armyUsername !== planet.minerUsername
      ) {
        info.fleetOwner = planet.armyUsername;
      }
      info.canSend = true;

      if (planet.artefacts) {
        info.timeArtefacts = planet.timeArtefacts;
      }
    } else {
      info.isHumans = false;
      info.canSend = true;
    }

    if (planet.mission) {
      const battleItem = Game.Battle.items[planet.mission.type];
      info.mission = {
        level: planet.mission.level,
        name: battleItem.name,
        reward: battleItem.level[planet.mission.level].reward,
      };
    }

    if (planet.isHome || planet.armyId || planet.mission) {
      const units = Game.Planets.getFleetUnits(planet._id);
      if (units) {
        let sideUnits = null;
        if (planet.mission) {
          sideUnits = reptileSpaceUnits;
        } else {
          sideUnits = humanSpaceUnits;
        }
        info.units = [];

        _.toPairs(sideUnits).forEach(([id, unit]) => {
          let count = null;
          if (_.isString(units[id])) {
            count = game.Battle.count[units[id]];
          } else {
            count = units[id];
          }
          info.units.push({
            id,
            unit,
            count: count || 0,
            countId: units[id],
          });
        });
      }
    }

    return info;
  }

  getPlanetDrop(planet = this.planet) {
    if (!planet) {
      return null;
    }

    const items = [];
    _.keys(planet.artefacts).forEach((key) => {
      items.push({
        id: key,
        name: Game.Artefacts.items[key].name,
        chance: planet.artefacts[key],
        url: Game.Artefacts.items[key].url(),
      });
    });

    let cards = null;
    if (planet.mission
     && Game.Battle.items[planet.mission.type]
     && Game.Battle.items[planet.mission.type].level[planet.mission.level].cards
    ) {
      const missionCards = Game.Battle.items[planet.mission.type].level[planet.mission.level].cards;
      cards = _.map(
        missionCards,
        (value, key) => ({
          engName: key,
          chance: value,
          name: Game.Cards.items.general[key].name,
        }),
      );
    }

    return {
      name: planet.name,
      type: Game.Planets.types[planet.type].name,
      items,
      cards,
    };
  }

  isMyPlanet() {
    return Meteor.user().username === this.planet.minerUsername;
  }

  getDropItems() {
    const dropItems = [];
    (this.drop.items).forEach((item) => {
      const dropItem = item;
      dropItem.icon = Game.Artefacts.items[item.id].icon;
      dropItems.push(dropItem);
    });

    return dropItems;
  }

  getTimeNextDrop(timeCollected) {
    const currentTime = Game.getCurrentServerTime();
    const collectPeriod = Game.Cosmos.COLLECT_ARTEFACTS_PERIOD;
    const passed = (currentTime - timeCollected) % collectPeriod;
    return collectPeriod - passed;
  }

  getReptilesFleetPower() {
    const { units } = this.planetInfo;
    return Game.Cosmos.reptilesFleetPower(units);
  }

  canMine() {
    const user = Meteor.user();
    return (
      this.planet.armyUsername === user.username
      && this.planet.minerUsername !== user.username
    );
  }

  canUnMine(planet = this.planet) {
    const user = Meteor.user();

    return (
      !planet.isHome
      && planet.status === Game.Planets.STATUS.HUMANS
      && planet.minerUsername === user.username
    );
  }

  sendFleet(event, planetId = this.planet._id) {
    event.preventDefault();
    if (planetId) {
      Game.Cosmos.showAttackMenu(planetId);
    }
  }

  mine(event, planetId = this.planet._id) {
    event.stopPropagation();
    if (planetId) {
      Meteor.call(
        'planet.startMining',
        planetId,
        (err) => {
          if (err) {
            Notifications.error(err.error);
          }
        },
      );
    }
  }

  unMine(event, planetId = this.planet._id) {
    event.stopPropagation();
    if (planetId) {
      Meteor.call(
        'planet.stopMining',
        planetId,
        (err) => {
          if (err) {
            Notifications.error(err.error);
          }
        },
      );
    }
  }

  edit(event, planetId = this.planet._id) {
    const targetPlanet = Game.Planets.getOne(planetId);
    const basePlanet = Game.Planets.getBase();

    Game.showInputWindow(
      'Как назвать планету?',
      targetPlanet.name,
      (name) => {
        if (!name) {
          return;
        }

        const planetName = name.trim();
        if (planetName === targetPlanet.name) {
          return;
        }

        if (planetId === basePlanet._id) {
          Meteor.call(
            'user.changePlanetName',
            planetName,
            (err) => {
              if (err) {
                Notifications.error(
                  'Невозможно сменить название планеты',
                  err.error,
                );
              }
            },
          );
        } else {
          Game.showAcceptWindow(
            `Изменение имени планеты стоит ${Game.Planets.RENAME_PLANET_PRICE} ГГК`,
            () => {
              const userResources = Game.Resources.getValue();
              const userCreditsCount = userResources.credits.amount;
              if (userCreditsCount < Game.Planets.RENAME_PLANET_PRICE) {
                Notifications.error('Недостаточно ГГК');
                return;
              }

              Meteor.call(
                'planet.changeName',
                planetId,
                planetName,
                function(err) {
                  if (err) {
                    Notifications.error(
                      'Невозможно сменить название планеты',
                      err.error,
                    );
                  }
                },
              );
            },
          );
        }
      },
    );
  }
}

SpacePlanetPopup.register('SpacePlanetPopup');

export default SpacePlanetPopup;
