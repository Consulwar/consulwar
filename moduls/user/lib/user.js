Meteor.startup(function () {

Game.User = {
	getVotePower: function() {
		var bonus = Meteor.user().votePowerBonus || 0;
		var level = Game.User.getLevel( Meteor.user().rating );
		
		return level + bonus;
	},

	getLevel: function(rating) {
		rating = rating || Meteor.user().rating;

		if (!rating || rating < 25000) {
			return 0;
		} else if (rating < 100000) {
			return 1;
		} else if (rating < 500000) {
			return 2;
		} else if (rating < 2500000) {
			return 3;
		} else if (rating < 10000000) {
			return 4;
		} else if (rating < 25000000) {
			return 5;
		} else if (rating < 50000000) {
			return 6;
		} else {
			return 7;
		}
	}
};

});