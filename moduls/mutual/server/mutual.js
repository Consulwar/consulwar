initMutualServer = function () {

initMutualLib();

Game.Mutual.add = function(item) {
	Game.Mutual.initialize(item.group);

	var inc = {};
	inc[item.engName] = parseInt(item.investments);

	Game.Mutual.Collection.update({
		group: item.group
	}, {
		$inc: inc
	});

	return inc;
};

Game.Mutual.initialize = function(group) {
	var currentValue = Game.Mutual.getValue(group);

	if (currentValue === undefined) {
		Game.Mutual.Collection.insert({
			group: group
		});
	}
};

Meteor.publish('mutualResearch', function () {
	if (this.userId) {
		var self = this;

		self.ready();
		// Временно все глобалы тут
		var handle = Game.Mutual.Collection.find(/*{group: 'research'}*/).observeChanges({
			added: function (id, fields) {
				self.added('mutual', id, fields);
			},
			changed: function (id, fields) {
				//console.log('and here too', id, fields);
				for (var name in fields) {
					//if (game.research.mutual[name].investments <= fields[name]) {
						self.changed('mutual', id, fields);
					//}
				}
			}
		});

		self.onStop(function () {
			handle.stop();
		});
	}
});

Meteor.publish('mutual', function (item) {
	if (this.userId) {
		var find = {
			group: item.group
		};
		var limit = {fields: {
			group: 1
		}};
		find[item.engName] = {$exists: true};
		limit.fields[item.engName] = 1;

		//console.log('here it is:', Game.Mutual.Collection.find(find, limit).fetch());

		//return Game.Mutual.Collection.find(find, limit);

		var self = this;
		self.ready();

		var handle = Game.Mutual.Collection.find(find).observeChanges({
			added: function (id, fields) {
				self.added('mutual', id, fields);
			},
			changed: function (id, fields) {
				//console.log('here', id, fields);
				// В общем не работает двойной обсерв.
				// ddp.js SessionDocumentView:changeField
				self.changed('mutual', id, fields);
			}
		});

		//var set = Game.Mutual.Collection.findOne(find);
		//self.added('mutual', set._id, set);

		self.onStop(function () {
			handle.stop();
		});
	}
});

initMutualServerInvestments();
initMutualServerMethods();

};