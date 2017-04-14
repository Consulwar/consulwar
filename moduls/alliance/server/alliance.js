initAllianceServer = function() {
'use strict';

initAllianceLib();
initAllianceServerMethods();

Game.Alliance.Collection._ensureIndex({
	owner: 1,
	deleted: 1
});

Game.Alliance.Collection._ensureIndex({
	name: 1,
	deleted: 1
});

Game.Alliance.Collection._ensureIndex({
	url: 1,
	deleted: 1
});

Game.Alliance.Collection._ensureIndex({
	tag: 1,
	deleted: 1
});

Game.Alliance.create = function(user, options) {
	let id = Game.Alliance.Collection.insert({
		owner: user.username,
		name: options.name,
		url: options.url,
		tag: options.tag,
		type: options.type,
		information: options.information,
		level: 1,
		participants: [],
		timestamp: Game.getCurrentTime()
	});

	Game.Alliance.addParticipant(options.url, user.username);

	return id;
};

Game.Alliance.get = function(id) {
	return Game.Alliance.Collection.findOne({
		_id: id,
		deleted: { $exists: false }
	});
};

Game.Alliance.getByUrl = function(url) {
	return Game.Alliance.Collection.findOne({
		url,
		deleted: { $exists: false }
	});
};

Game.Alliance.addParticipant = function(allianceUrl, username) {
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
};

Game.Alliance.removeParticipant = function(allianceUrl, username) {
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
};

SyncedCron.add({
	name: 'Инвалидация устаревших запросов в альянсы',
	schedule: function(parser) {
		return parser.text(Game.Alliance.INVALIDATE_SCHEDULE);
	},
	job: function() {
		Game.Alliance.Contact.checkForInvalidatingAll();
	}
});

initAllianceContactServer();

};