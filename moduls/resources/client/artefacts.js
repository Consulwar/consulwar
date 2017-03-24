initResourcesClientArtefacts = function() {
'use strict';

initArtefactsLib();

Game.Resources.showArtefactsPage = function() {
	var item = this.params.item;

	this.render('item_artefact', {
		to: 'content',
		data: {
			subgroup: 'artefacts',
			item: Game.Artefacts.items[item]
		}
	});
};

var getPlanetsByArtefact = function(artefactId) {
	var basePlanet = Game.Planets.getBase();
	var planets = Game.Planets.getByArtefact(artefactId);

	for (let i = 0; i < planets.length; i++) {
		planets[i].distance = Game.Planets.calcDistance(planets[i], basePlanet);
		planets[i].chance = planets[i].artefacts[artefactId];
	}

	return planets;
};

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
		return _.sortBy(getPlanetsByArtefact(this.item.engName), function(planet) {
			return planet.chance;
		}).reverse().splice(0, limit);
	},

	nearestPlanets: function(limit = 4) {
		return _.sortBy(getPlanetsByArtefact(this.item.engName), function(planet) {
			return planet.distance;
		}).splice(0, limit);
	},

	userPlanets: function() {
		var planets = _.filter(getPlanetsByArtefact(this.item.engName), function(planet) {
			return planet.armyId;
		});

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