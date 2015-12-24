Meteor.startup(function() {

Game.Global.set = function(item) {
	Game.Global.initialize(item.group);

	var currentValue = Game.Global.getValue(item.group);

	var set = {};

	set[item.engName] = parseInt((currentValue[item.engName] || 0) + item.investments);

	Game.Global.Collection.update({group: item.group}, {$set: set});

	return set;
}

Game.Global.add = function(item) {
	return Game.Global.set(item);
}

Game.Global.initialize = function(group) {
	var currentValue = Game.Global.getValue(group);

	if (currentValue == undefined) {
		Game.Global.Collection.insert({
			group: group
		})
	}
}

Meteor.publish('globalResearch', function () {
	if (this.userId) {
		var self = this;

		self.ready();
		// Временно все глобалы тут
		var handle = Game.Global.Collection.find(/*{group: 'research'}*/).observeChanges({
			added: function (id, fields) {
				self.added('global', id, fields);
			},
			changed: function (id, fields) {
				//console.log('and here too', id, fields);
				for (var name in fields) {
					//if (game.research.global[name].investments <= fields[name]) {
						self.changed('global', id, fields);
					//}
				}
			}
		});

		self.onStop(function () {
			handle.stop();
		});
	}
});

Meteor.publish('global', function (item) {
	if (this.userId) {
		var find = {
			group: item.group
		}
		var limit = {fields: {
			group: 1
		}};
		find[item.engName] = {$exists: true};
		limit.fields[item.engName] = 1;

		//console.log('here it is:', Game.Global.Collection.find(find, limit).fetch());

		//return Game.Global.Collection.find(find, limit);

		var self = this;
		self.ready();

		var handle = Game.Global.Collection.find(find).observeChanges({
			added: function (id, fields) {
				self.added('global', id, fields);
			},
			changed: function (id, fields) {
				//console.log('here', id, fields);
				// В общем не работает двойной обсерв.
				// ddp.js SessionDocumentView:changeField
				self.changed('global', id, fields);
			}
		});

		//var set = Game.Global.Collection.findOne(find);
		//self.added('global', set._id, set);

		self.onStop(function () {
			handle.stop();
		});
	}
});

});