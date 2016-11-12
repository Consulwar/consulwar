initResourcesClientArtefacts = function() {

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

Template.item_artefact.helpers({
	subgroupItems: function() {
		return _.map(Game.Artefacts.items, function(item) {
			return item;
		});
	},

	planets: function() {
		var artefactId = this.item.engName;

		var basePlanet = Game.Planets.getBase();
		var planets = Game.Planets.getByArtefact(artefactId);
		var nearest = [];
		var top = [];

		var i = 0;
		var n = 0;

		for (i = 0; i < planets.length; i++) {
			// insert additional info
			planets[i].chance = planets[i].artefacts[artefactId];

			// insert nearest
			n = nearest.length;
			while (n-- > 0) {
				var toNearest = Game.Planets.calcDistance(nearest[n], basePlanet);
				var toCurrent = Game.Planets.calcDistance(planets[i], basePlanet);
				if (toNearest <= toCurrent) {
					break;
				}
			}
			nearest.splice(n + 1, 0, planets[i]);

			// insert top
			n = top.length;
			while (n-- > 0) {
				var topValue = top[n].artefacts[artefactId];
				var curValue = planets[i].artefacts[artefactId];
				if (curValue <= topValue) {
					break;
				}
			}
			top.splice(n + 1, 0, planets[i]);
		}

		// aggregate results
		var result = nearest.splice(0, 3);
		n = 0;
		while (result.length < 6 && top.length > 0) {
			var planet = top.shift();
			var isDuplicated = false;
			for (i = 0; i < result.length; i++) {
				if (planet._id == result[i]._id) {
					isDuplicated = true;
					break;
				}
			}
			if (!isDuplicated) {
				result.splice(result.length - n, 0, planet);
				n++;
			}
		}

		return result.length > 0 ? result : null;
	}
});

};