import Game from '/moduls/game/lib/main.game';
import FlightEvents from './flightEvents';
import BattleEvents from './battleEvents';
import Ship from './Ship';

class Galaxy {
  constructor({
    planets = Game.Planets.getAll().fetch(),
    fleets = FlightEvents.getFleetsEvents().fetch(),
    battleEvents = BattleEvents.getAllByUserId().fetch(),
  }) {
    this.planets = planets;
    this.fleets = fleets;
    this.battleEvents = battleEvents;
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
    planets.forEach((planet) => {
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

      circle.on('mouseover', function() {
        if (!isPopupLocked.get()) {
          Game.Cosmos.showPlanetPopup(planet._id, false, offset);
        }
      });

      circle.on('mouseout', function() {
        if (!isPopupLocked.get()) {
          Game.Cosmos.hidePlanetPopup();
        }
      });

      circle.on('click', function(event) {
        Game.Cosmos.showPlanetInfo(planet._id, offset);
        L.DomEvent.stopPropagation(event);
      });

      if (planet.mission || planet.armyId) {
        const ship = new Ship({
          isStatic: true,
          planet,
          planetRadius: radius,
          mapView,
          shipsLayer,
          isPopupLocked,
          origin: offset,
        });
      }
    });
  }

  renderFleets(shipsLayer) {

  }

  renderBattles(shipsLayer) {

  }
}

export default Galaxy;
