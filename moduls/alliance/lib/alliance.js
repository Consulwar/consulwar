initAllianceLib = function() {
'use strict';

Game.Alliance = {
	Collection: new Meteor.Collection('alliances'),

	type: {
		PUBLIC: 0,
		OPEN: 1,
		PRIVATE: 2
	},

	addParticipant: function(allianceUrl, user) {
		Game.Alliance.Collection.update({
			url: allianceUrl
		},{
			$push: {
				participants: user.username
			}
		});

		Meteor.users.update({
			_id: Meteor.userId()
		}, {
			$set: {
				alliance: allianceUrl
			}
		});
	},

	removeParticipant: function(allianceUrl, user) {
		Game.Alliance.Collection.update({
			url: allianceUrl
		},{
			$pull: {
				participants: user.username
			}
		});

		Meteor.users.update({
			_id: Meteor.userId()
		}, {
			$unset: {
				alliance: 1
			}
		});
	}
};

initAllianceConfigLib();
};