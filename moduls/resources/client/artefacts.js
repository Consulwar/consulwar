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
    planets.forEach(fillPlanetChance.bind(this, this.item.engName));
    planets.forEach(calculatePlanetDistance)
    return _(planets).sortBy(function(planet) {
      return planet.chance;
    })
    .reverse()
    .splice(0, limit);
  },

  nearestPlanets: function(limit = 4) {
    const planets = Game.Planets.getByArtefact(this.item.engName);
    planets.forEach(fillPlanetChance.bind(this, this.item.engName));
    planets.forEach(calculatePlanetDistance);
    return _(planets).sortBy(function(planet) {
      return planet.distance;
    }).splice(0, limit);
  },

  userPlanets: function() {
    const planets = Game.Planets.getByArtefact(this.item.engName, Meteor.user().username);
    planets.forEach(fillPlanetChance.bind(this, this.item.engName));

    return planets.length && {
      planets: planets.length,
      chance: {
        min: _.min(planets, function(planet) {
          return planet.chance;
        }).chance,
        max: _.max(planets, function(planet) {
          return planet.chance;
        }).chance,
        total: _.reduce(planets, function(memo, planet) { 
          return memo + planet.chance; 
        }, 0) * (86400 / Game.Cosmos.COLLECT_ARTEFACTS_PERIOD) / 100
      },
      collection: _.min(planets, function(planet) {
        return planet.timeArtefacts;
      }).timeArtefacts
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