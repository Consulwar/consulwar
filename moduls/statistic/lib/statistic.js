initStatisticLib = function() {

Game.Statistic = {
	Collection: new Meteor.Collection('statistic'),

	getSortFieldForType: function(type) {
		check(type);
		return this.sortFieldsForTypes[type] && this.sortFieldsForTypes[type].field;
	},

	getSortFieldNameForType: function(type) {
		check(type);
		return this.sortFieldsForTypes[type] && this.sortFieldsForTypes[type].name;
	},

	sortFieldsForTypes: {
		general: {
			field: 'rating',
			name: 'Рейтинг'
		},
		science: {
			field: 'research.total',
			name: 'Исследовано технологий'
		},
		communication: {
			field: 'chat.messages',
			name: 'Всего сообщений'
		},
		cosmos: {
			field: 'resources.gained.honor',
			name: 'Честь'
		},
		battle: {
			field: 'reinforcements.sent.total',
			name: 'Отправлено сообщений'
		}
	},

	getUser: function() {
		return Game.Statistic.Collection.findOne({
			user_id: Meteor.userId()
		});
	},

	getUserValue: function(field, statistic) {
		if (statistic === undefined) {
			statistic = Game.Statistic.getUser();
		}

		return field.split('.').reduce(function(obj, key) {
			return (obj !== undefined && obj[key] !== undefined) ? obj[key] : 0;
		}, statistic);
	},

	getSystem: function() {
		return Game.Statistic.Collection.findOne({
			user_id: 'system'
		});
	},

	getSystemValue: function(field, statistic) {
		if (statistic === undefined) {
			statistic = Game.Statistic.getSystem();
		}
		
		return field.split('.').reduce(function(obj, key) {
			return (obj !== undefined && obj[key] !== undefined) ? obj[key] : 0;
		}, statistic);
	}
};

};