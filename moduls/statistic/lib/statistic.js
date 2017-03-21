initStatisticLib = function() {
'use strict';

Game.Statistic = {
	Collection: new Meteor.Collection('statistic'),

	getSortFieldForType: function(type) {
		check(type, String);
		if (!this.sortFieldsForTypes.hasOwnProperty(type)) {
			throw new Meteor.Error('Несуществующий тип статистики');
		}
		return this.sortFieldsForTypes[type];
	},

	sortFieldsForTypes: {
		general: {
			field: 'rating',
			title: 'Рейтинг'
		},
		science: {
			field: 'research.total',
			title: 'Исследовано технологий'
		},
		communication: {
			field: 'chat.messages',
			title: 'Всего сообщений'
		},
		cosmos: {
			field: 'resources.gained.honor',
			title: 'Честь'
		},
		battle: {
			field: 'reinforcements.sent.total',
			title: 'Отправлено войск'
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

initStatisticConfigLib();

};