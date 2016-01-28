initHouseLib = function() {

Game.House = {};

Game.HouseItems = {
	Collection: new Meteor.Collection('houseItems'),

	getValue: function() {
		return Game.HouseItems.Collection.findOne({user_id: Meteor.userId()});
	},

	getItem: function(group, name) {
		var items = Game.HouseItems.getValue();

		if (items && items[group] && items[group][name]) {
			return items[group][name];
		} else {
			return 0;
		}
	},

	getPlaced: function() {
		var result = [];

		var items = Game.HouseItems.getValue();
		for (var groupKey in items) {
			if (!items[groupKey]) continue;

			for (var itemKey in items[groupKey]) {
				if (items[groupKey][itemKey].isPlaced) {
					result.push(groupKey + ' ' + itemKey);
				}
			}
		}

		return result;
	},

	// TODO: Переместить настройку в другое место!
	items: {
		'chairs': [{
			engName: 'chair1',
			name: 'Стул номер 1',
			credits: Math.round( Math.random() * 500 + 10000 )
		}, {
			engName: 'chair2',
			name: 'Стул номер 2',
			credits: Math.round( Math.random() * 500 + 10000 )
		}, {
			engName: 'chair3',
			name: 'Стул номер 3',
			credits: Math.round( Math.random() * 500 + 10000 )
		}, {
			engName: 'chair4',
			name: 'Стул номер 4',
			credits: Math.round( Math.random() * 500 + 10000 )
		}, {
			engName: 'chair5',
			name: 'Стул номер 5',
			credits: Math.round( Math.random() * 500 + 10000 )
		}, {
			engName: 'chair6',
			name: 'Стул номер 6',
			credits: Math.round( Math.random() * 500 + 10000 )
		}, {
			engName: 'chair7',
			name: 'Стул номер 7',
			credits: Math.round( Math.random() * 500 + 10000 )
		}, {
			engName: 'chair8',
			name: 'Стул номер 8',
			credits: Math.round( Math.random() * 500 + 10000 )
		}, {
			engName: 'chair9',
			name: 'Стул номер 9',
			credits: Math.round( Math.random() * 500 + 10000 )
		}, {
			engName: 'chair10',
			name: 'Стул номер 10',
			credits: Math.round( Math.random() * 500 + 10000 )
		}, {
			engName: 'chair11',
			name: 'Стул номер 11',
			credits: Math.round( Math.random() * 500 + 10000 )
		}, {
			engName: 'chair12',
			name: 'Стул номер 12',
			credits: Math.round( Math.random() * 500 + 10000 )
		}, {
			engName: 'chair13',
			name: 'Стул номер 13',
			credits: Math.round( Math.random() * 500 + 10000 )
		}]
	},

	getGroupConfig: function(group) {
		return Game.HouseItems.items[group];
	},

	getItemConfig: function(group, name) {
		var groupItems = Game.HouseItems.items[group];
		if (groupItems) {
			for (var i = 0; i < groupItems.length; i++) {
				if (groupItems[i].engName == name) {
					return groupItems[i];
				}
			}
		}
		return null;
	}
}

}