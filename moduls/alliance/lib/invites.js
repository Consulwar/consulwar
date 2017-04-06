initAllianceInvitesLib = function() {
'use strict';

Game.Alliance.Invites = {
	Collection: new Meteor.Collection('alliance_invites'),

	status: {
		SENT: 0,
		INVALIDATED: 1,
		ACCEPTED: 2,
		DECLINED: 3
	}
};

};