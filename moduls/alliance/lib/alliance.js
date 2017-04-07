initAllianceLib = function() {
'use strict';

Game.Alliance = {
	Collection: new Meteor.Collection('alliances'),

	type: {
		PUBLIC: 0,
		OPEN: 1,
		PRIVATE: 2
	},

	addParticipant: function(allianceUrl, username) {
		Game.Alliance.Collection.update({
			url: allianceUrl
		},{
			$push: {
				participants: username
			}
		});

		Meteor.users.update({
			username: username
		}, {
			$set: {
				alliance: allianceUrl
			}
		});
	},

	removeParticipant: function(allianceUrl, username) {
		Game.Alliance.Collection.update({
			url: allianceUrl
		},{
			$pull: {
				participants: username
			}
		});

		Meteor.users.update({
			username: username
		}, {
			$unset: {
				alliance: 1
			}
		});
	}
};

initAllianceConfigLib();
};