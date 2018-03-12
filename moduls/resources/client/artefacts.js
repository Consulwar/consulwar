import artifacts from '/imports/content/Resource/Artifact/client';
import MenuArtifacts from '/imports/client/ui/blocks/Menu/Artifacts/MenuArtifacts';

initResourcesClientArtefacts = function() {
'use strict';

Game.Resources.showArtefactsPage = function() {
  var item = Game.Artefacts.items[this.params.item];
  
  this.render(
    (new MenuArtifacts({
      hash: {
        items: artifacts,
        selected: item,
      },
    })).renderComponent(),
    { to: 'bottomMenu' }
  );

  this.render('item_artefact', {
    to: 'content',
    data: {
      subgroup: 'artefacts',
      item,
    }
  });
};

const calculatePlanetDistance = function(planet) {
  const basePlanet = Game.Planets.getBase();
  planet.distance = Game.Planets.calcDistance(planet, basePlanet);
}
const fillPlanetChance = function(artefactId, planet) {
  planet.chance = planet.artefacts[artefactId];
}

Template.item_artefact.onRendered(function() {
  $('.content .scrollbar-inner').perfectScrollbar();
});

Template.item_artefact.helpers({
  subgroupItems: function() {
    return _.map(Game.Artefacts.items, function(item) {
      return item;
    });
  },

  topPlanets: function(limit = 4) {
    const planets = Game.Planets.getByArtefact(this.item.engName);
    planets.forEach(planet => {
      fillPlanetChance(this.item.engName, planet);
      calculatePlanetDistance(planet);
    });
    return _(planets).sortBy(planet => planet.chance)
    .reverse()
    .splice(0, limit);
  },

  nearestPlanets: function(limit = 4) {
    const planets = Game.Planets.getByArtefact(this.item.engName);
    planets.forEach(planet => {
      fillPlanetChance(this.item.engName, planet);
      calculatePlanetDistance(planet);
    });
    return _(planets).sortBy(planet => planet.distance).splice(0, limit);
  },

  userPlanets: function() {
    const planets = Game.Planets.getByArtefact(this.item.engName, Meteor.user().username);
    planets.forEach(planet => fillPlanetChance(this.item.engName, planet));

    return planets.length && {
      planets: planets.length,
      chance: {
        min: _.min(planets, planet => planet.chance).chance,
        max: _.max(planets, planet => planet.chance).chance,
        total: _.reduce(planets, (memo, planet) => memo + planet.chance, 0) * (86400 / Game.Cosmos.COLLECT_ARTEFACTS_PERIOD) / 100
      },
      collection: _.min(planets, planet => planet.timeArtefacts).timeArtefacts
    };
  },

  getTimeNextDrop: function(timeCollected) {
    var passed = ( Session.get('serverTime') - timeCollected ) % Game.Cosmos.COLLECT_ARTEFACTS_PERIOD;
    return Game.Cosmos.COLLECT_ARTEFACTS_PERIOD - passed;
  }
});

Template.item_artefact.events({
  'click .toggle_description': function(e, t) {
    $(t.find('.description')).slideToggle(function() {
      var options = Meteor.user().settings && Meteor.user().settings.options;
      Meteor.call('settings.setOption', 'hideDescription', !(options && options.hideDescription));
    });
  }
});

};