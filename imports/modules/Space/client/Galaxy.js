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

    Game.Planets.Collection.find({ username }).observeChanges({
      added: (id, planet) => {
        planet._id = id;
        this.showPlanet(planet);
      },

      changed: (id, fields) => {
        if (
          (fields.mission !== undefined && fields.mission !== null)
          || (fields.armyId !== undefined && fields.armyId !== null)
        ) {
          const planet = Game.Planets.getOne(id);
          const radius = 0.01 + (planet.size / 20);
          const ship = new Ship({
            isStatic: true,
            planet,
            planetRadius: radius,
            mapView,
            shipsLayer,
            isPopupLocked,
            origin: this.offset,
          });
        }
      },
    });
  }

  showPlanet(planet) {
    const offset = this.offset;

    let color;
    if (planet.status === Game.Planets.STATUS.HUMANS) {
      if (planet.username === this.user.username) {
        color = Config.colors.user;
      } else if (this.myAllies.indexOf(planet.username) !== -1) {
        color = Config.colors.ally;
      } else {
        color = Config.colors.other;
      }
    } else if (planet.status === Game.Planets.STATUS.REPTILES) {
      color = Config.colors.enemy;
    } else {
      color = Config.colors.empty;
    }

    const radius = 0.01 + (planet.size / 20);
    const circle = L.circle(
      [planet.x + offset.x, planet.y + offset.y],
      {
        radius,
        color,
        fillOpacity: 0.8,
      },
    ).addTo(this.planetsLayer);

    circle.on('mouseover', () => {
      if (!this.isPopupLocked.get()) {
        Game.Cosmos.showPlanetPopup(planet._id, false, offset);
      }
    });

    circle.on('mouseout', () => {
      if (!this.isPopupLocked.get()) {
        Game.Cosmos.hidePlanetPopup();
      }
    });

    circle.on('click', (event) => {
      Game.Cosmos.showPlanetInfo(planet._id, offset);
      L.DomEvent.stopPropagation(event);
    });

    if (planet.mission || planet.armyId) {
      const ship = new Ship({
        isStatic: true,
        planet,
        planetRadius: radius,
        mapView: this.mapView,
        shipsLayer: this.shipsLayer,
        isPopupLocked: this.isPopupLocked,
        origin: offset,
      });
    }
  }

  reRender(offset) {
    this.offset = offset;

    Game.Planets.Collection.find({ username: this.username }).fetch().forEach((planet) => {
      this.showPlanet(planet);
    });
  }
}

export default Galaxy;
