import Game from '/moduls/game/lib/main.game';
import FlightEvents from './flightEvents';
import BattleEvents from './battleEvents';
import Ship from './Ship';
import BattleIcon from './BattleIcon';

class Galaxy {
  constructor({
    username,
    planets = Game.Planets.getAll().fetch(),
    isPopupLocked,
    mapView,
  }) {
    this.username = username;
    this.planets = planets;
    this.isPopupLocked = isPopupLocked;
    this.mapView = mapView;
  }

  render({
    offset,
    planetsLayer,
    pathsLayer,
    shipsLayer,
  }) {
    this.offset = offset;

    this.renderPlanets(planetsLayer, shipsLayer);
  }

  clear() {

  }

  addShip() {

  }

  renderPlanets(planetsLayer, shipsLayer) {
    const offset = this.offset;

    this.planets.forEach((planet) => {
      const color = (
        planet.status === Game.Planets.STATUS.HUMANS
          ? '#c6e84c'
          : (
            planet.status === Game.Planets.STATUS.REPTILES
              ? '#dc6257'
              : '#ffffff'
          )
      );
      const radius = 0.01 + (planet.size / 20);
      const circle = L.circle(
        [planet.x + offset[0], planet.y + offset[1]],
        {
          radius,
          color,
          fillOpacity: 0.8,
        },
      ).addTo(planetsLayer);

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
          shipsLayer,
          isPopupLocked: this.isPopupLocked,
          origin: offset,
        });
      }
    });
  }
}

export default Galaxy;
