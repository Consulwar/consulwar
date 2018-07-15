import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Notifications } from '/moduls/game/lib/importCompability';
import Game from '/moduls/game/lib/main.game';
import { Meteor } from 'meteor/meteor';
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
      drop,
      allowActions,
      allowEdit,
      position,
      isMapView = false,
    },
  }) {
    super();

    this.planet = planet;
    this.planetId = planet._id;
    this.isMapView = isMapView;
    this.planetInfo = Game.Cosmos.getPlanetInfo(this.planet);
    this.drop = drop;
    this.position = position;
    this.allowActions = allowActions;
    this.allowEdit = allowEdit;
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
    return Game.Cosmos.getTimeNextDrop(timeCollected);
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

  sendFleet(event, planetId = this.planetId) {
    event.preventDefault();
    if (planetId) {
      Game.Cosmos.showAttackMenu(planetId);
    }
  }

  mine(event, planetId = this.planetId) {
    event.stopPropagation();
    if (planetId) {
      Meteor.call(
        'planet.startMining',
        planetId,
        (error) => {
          if (error) {
            Notifications.error(error.error);
          }
        },
      );
    }
  }

  unMine(event, planetId = this.planetId) {
    event.stopPropagation();
    if (planetId) {
      Meteor.call('planet.stopMining', planetId, (error) => {
        if (error) {
          Notifications.error(error.error);
        }
      });
    }
  }

  edit(event, planetId = this.planetId) {
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
