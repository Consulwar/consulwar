import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import { _ } from 'lodash';
import { $ } from 'meteor/jquery';
import Game from '/moduls/game/lib/main.game';
import './Artifact.html';
import './Artifact.styl';

class Artifact extends BlazeComponent {
  template() {
    return 'Artifact';
  }

  constructor({
    hash: {
      item,
    },
  }) {
    super();

    this.item = item;
  }

  fillPlanetChance(artefactId, planet) {
    return planet.artefacts[artefactId];
  }

  topPlanets(limit = 4) {
    const planets = Game.Planets.getByArtefact(this.item.engName);
    const basePlanet = Game.Planets.getBase();
    planets.forEach((item) => {
      const planet = item;
      planet.chance = this.fillPlanetChance(this.item.engName, planet);
      planet.distance = Game.Planets.calcDistance(planet, basePlanet);
    });
    return (_.sortBy(planets, planet => planet.chance)
      .reverse()
      .splice(0, limit)
    );
  }

  nearestPlanets(limit = 4) {
    const planets = Game.Planets.getByArtefact(this.item.engName);
    const basePlanet = Game.Planets.getBase();
    planets.forEach((item) => {
      const planet = item;
      planet.chance = this.fillPlanetChance(this.item.engName, planet);
      planet.distance = Game.Planets.calcDistance(planet, basePlanet);
    });
    return _.sortBy(planets, planet => planet.distance).splice(0, limit);
  }

  userPlanets() {
    const planets = Game.Planets.getByArtefact(this.item.engName, Meteor.user().username);
    planets.forEach((item) => {
      const planet = item;
      planet.chance = this.fillPlanetChance(this.item.engName, planet);
    });

    return planets.length && {
      planets: planets.length,
      chance: {
        min: _.min(planets, planet => planet.chance).chance,
        max: _.max(planets, planet => planet.chance).chance,
        total: (
          _.reduce(
            planets,
            (memo, planet) => memo + planet.chance, 0,
          ) * (86400 / Game.Cosmos.COLLECT_ARTEFACTS_PERIOD)
        ) / 100,
      },
      collection: _.min(planets, planet => planet.timeArtefacts).timeArtefacts,
    };
  }

  getTimeNextDrop(timeCollected) {
    const collectPeriod = Game.Cosmos.COLLECT_ARTEFACTS_PERIOD;
    const passed = (Game.getCurrentServerTime() - timeCollected) % collectPeriod;
    return collectPeriod - passed;
  }

  toggleDescription() {
    const options = Meteor.user().settings && Meteor.user().settings.options;
    $(this.find('.cw--Artifact__info')).slideToggle(function() {
      Meteor.call(
        'settings.setOption',
        'hideDescription',
        !(options && options.hideDescription),
      );
    });
  }

  closeWindow() {
    window.history.go(-1);
    this.removeComponent();
  }
}

Artifact.register('Artifact');

export default Artifact;
