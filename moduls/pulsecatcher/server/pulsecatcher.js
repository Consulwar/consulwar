initPulsecatcherServer = function() {

initPulsecatcherLib();

Meteor.methods({
	'pulsecatcher.voteBonus': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		// TODO: Implement!
	},

	'pulsecatcher.activateBonus': function(id) {
		// TODO: Implement!
	}
});

};