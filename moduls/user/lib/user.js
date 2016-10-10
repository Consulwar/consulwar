Meteor.startup(function () {

Game.User = {
	getVotePower: function(user) {
		user = user || Meteor.user();
		var bonus = user.votePowerBonus || 0;
		var level = Game.User.getLevel( user.rating );
		
		return level + bonus;
	},

	iconPath: function(user) {
		if (user.settings && user.settings.chat && user.settings.chat.icon) {
			return user.settings.chat.icon;
		}
		return 'common/1';
	},

	levels: [
		{ rating: 0, name: 'Новичек' },
		{ rating: 25000, name: 'Консул' },
		{ rating: 100000, name: 'Правитель' },
		{ rating: 500000, name: 'Император' },
		{ rating: 2500000, name: 'Великий' },
		{ rating: 10000000, name: 'Высший' },
		{ rating: 25000000, name: 'Непогрешимый' },
		{ rating: 50000000, name: 'Лик всемогущего' }
	],

	getLevel: function(rating) {
		rating = arguments.length === 0 ? Meteor.user().rating : rating;
		rating = (rating && _.isNumber(rating)) ? rating : 0;

		for (var level = 0; level < this.levels.length - 1; level++) {
			if (rating < this.levels[level + 1].rating) {
				return level;
			}
		}

		return this.levels.length - 1;
	},

	getRatingForLevel: function(level) {
		level = _.isNumber(level) ? level : 0;
		return this.levels[level].rating;
	},

	getMaxLevel: function() {
		return this.levels.length - 1;
	},

	getLevelName: function(rating) {
		rating = arguments.length === 0 ? Meteor.user().rating : rating;
		return this.levels[this.getLevel(rating)].name;
	}
};

});