import { L } from '/moduls/game/lib/importCompability';
import Game from '/moduls/game/lib/main.game';
import Ship from './Ship';
import Config from './config';

class Galaxy {
  constructor({
    user,
    username,
    isPopupLocked,
    mapView,
    planetsLayer,
    shipsLayer,
    offset,
    myAllies,
  }) {
    this.user = user;
    this.username = username;
    this.isPopupLocked = isPopupLocked;
    this.mapView = mapView;
    this.planetsLayer = planetsLayer;
    this.shipsLayer = shipsLayer;
    this.offset = offset;
    this.myAllies = myAllies;
    this.circles = {};

    Game.Planets.Collection.find({ username }).observeChanges({
      added: (id, planet) => {
        this.showPlanet(id, planet);
      },

      changed: (id, fields) => {
        if (fields.status !== undefined || fields.minerUsername !== undefined) {
          const planet = Game.Planets.getOne(id);
          this.circles[id].setStyle({
            color: this.getColor(planet),
          });
        }

        if (
          (fields.mission !== undefined && fields.mission !== null)
          || (fields.armyId !== undefined && fields.armyId !== null)
        ) {
          const planet = Game.Planets.getOne(id);
          const radius = 0.01 + (planet.size / 20);
          // eslint-disable-next-line no-new
          new Ship({
            isStatic: true,
            planet,
            planetId: id,
            planetRadius: radius,
            mapView,
            shipsLayer,
            isPopupLocked,
            origin: this.offset,
            user,
            myAllies: this.myAllies,
          });
        }
      },
    });
  }

  showPlanet(id, planet) {
    const offset = this.offset;

    const radius = 0.01 + (planet.size / 20);
    const circle = L.circle(
      [planet.x + offset.x, planet.y + offset.y],
      {
        radius,
        color: this.getColor(planet),
        fillOpacity: 0.8,
      },
    ).addTo(this.planetsLayer);

    circle.on('mouseover', () => {
      if (!this.isPopupLocked.get()) {
        Game.Cosmos.showPlanetPopup(id, false, offset);
      }
    });

    circle.on('mouseout', () => {
      if (!this.isPopupLocked.get()) {
        Game.Cosmos.hidePlanetPopup();
      }
    });

    circle.on('click', (event) => {
      Game.Cosmos.showPlanetInfo(id, offset);
      L.DomEvent.stopPropagation(event);
    });

    if (planet.mission || planet.armyId) {
      // eslint-disable-next-line no-new
      new Ship({
        isStatic: true,
        planet,
        planetId: id,
        planetRadius: radius,
        mapView: this.mapView,
        shipsLayer: this.shipsLayer,
        isPopupLocked: this.isPopupLocked,
        origin: offset,
        user: this.user,
        myAllies: this.myAllies,
      });
    }

    this.circles[id] = circle;
  }

  reRender(offset) {
    this.offset = offset;

    Game.Planets.Collection.find({ username: this.username }).fetch().forEach((planet) => {
      this.showPlanet(planet._id, planet);
    });
  }

  getColor(planet) {
    if (planet.status === Game.Planets.STATUS.HUMANS) {
      if (planet.minerUsername === this.user.username) {
        return Config.colors.user;
      } else if (this.myAllies.indexOf(planet.minerUsername) !== -1) {
        return Config.colors.ally;
      }
      return Config.colors.other;
    } else if (planet.status === Game.Planets.STATUS.REPTILES) {
      return Config.colors.enemy;
    }
    return Config.colors.empty;
  }
}

export default Galaxy;
