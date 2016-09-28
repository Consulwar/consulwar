initSettingsServer = function() {

initSettingsLib();

Meteor.methods({
	'settings.enableVacationMode': function() {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}


		if (!Game.Cards.activate(Game.Cards.items.penalty.vacation, user)) {
			throw new Meteor.Error('Иди работай!');
		}


		Meteor.users.update({
			_id: user._id
		}, {
			$set: {
				onVacation: true
			}
		});
	},

	'settings.disableVacationMode': function() {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (!Game.Cards.deactivate(Game.Cards.items.penalty.vacation, user)) {
			throw new Meteor.Error('Отдохни еще немного!');
		}

		Meteor.users.update({
			_id: user._id
		}, {
			$set: {
				onVacation: false
			}
		});
	},

	'settings.sendVerifyEmail': function(email) {
		check(email, String);

		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		for (var i = 0; i < user.emails.length; i++) {
			if (user.emails[i].address == email) {
				if (user.emails[i].verified) {
					throw new Meteor.Error('Email ' + email + ' уже верифицирован.');
				}
				Accounts.sendVerificationEmail(user._id, email);
				return true;
			}
		}

		throw new Meteor.Error('Email ' + email + ' не найден.');
	},

	'settings.changeEmail': function(oldEmail, newEmail) {
		check(oldEmail, String);
		check(newEmail, String);

		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		for (var i = 0; i < user.emails.length; i++) {
			if (user.emails[i].address == oldEmail) {
				if (user.emails[i].verified) {
					throw new Meteor.Error('Нельзя изменить верифицированный email.');
				}

				Accounts.addEmail(user._id, newEmail);
				Accounts.removeEmail(user._id, oldEmail);

				return true;
			}
		}

		throw new Meteor.Error('Email ' + oldEmail + ' не найден.');
	},

	'settings.setSubscribed': function(email, subscribed) {
		check(email, String);
		check(subscribed, Boolean);
		
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		for (var i = 0; i < user.emails.length; i++) {
			if (user.emails[i].address == email) {
				var set = {};
				set['emails.' + i.toString() + '.unsubscribed'] = !subscribed;
				Meteor.users.update({
					_id: user._id
				}, {
					$set: set
				});
				return true;
			}
		}

		throw new Meteor.Error('Email ' + email + ' не найден.');
	},

	'settings.setEmailLettersFrequency': function (emailLettersFrequency) {
		check(emailLettersFrequency, String);
		
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (!Game.Settings.emailLettersFrequency.hasOwnProperty(emailLettersFrequency)) {
			throw new Meteor.Error('Неправильная частота писем');
		}

		var set = {};
		set['settings.email.lettersFrequency'] = emailLettersFrequency;
		Meteor.users.update({
			_id: user._id
		}, {
			$set: set
		});
	},

	'settings.changeNotifications': function (field, value) {
		check(field, String);
		check(value, Boolean);
		
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (Game.Settings.notificationFields.indexOf(field) == -1) {
			throw new Meteor.Error('Несуществующее поле настроек');
		}

		var set = {};
		set['settings.notifications.' + field] = value;
		Meteor.users.update({
			_id: user._id
		}, {
			$set: set
		});
	}
});

};

/*
db.users.findOne({})
{
        "_id" : "NxqpmGyP82kqdmxbv",
        "createdAt" : ISODate("2016-08-02T20:52:11.055Z"),
        "services" : {
                "password" : {
                        "bcrypt" : "$2a$10$pxFk58nivoZdS3FQ2EqGi.BCqQSQ1fyboWZETOiwPn3qCggTEvaUO"
                },
                "resume" : {
                        "loginTokens" : [
                                {
                                        "when" : ISODate("2016-08-02T20:52:11.110Z"),
                                        "hashedToken" : "qgszKvF7Yp32BseHCKCTkpuTP7N5pRfTrSUMHucsNT8="
                                }
                        ]
                },
                "email" : {
                        "verificationTokens" : [
                                {
                                        "token" : "5mhSRXgIiMx_mLwkIFZ_dhu3cpjoVg8pSPxuj-3Lbxy",
                                        "address" : "dream@gmail.com",
                                        "when" : ISODate("2016-08-02T20:52:13.108Z")
                                }
                        ]
                }
        },
        "username" : "dream",
        "emails" : [
                {
                        "address" : "dream@gmail.com",
                        "verified" : false
                }
        ],
        "inviteCode" : "1234",
        "plain_username" : "dream",
        "planetName" : "TOR-2QE",
        "game" : {
                "updated" : 1470171131
        },
        "status" : {
                "online" : false,
                "lastLogin" : {
                        "date" : ISODate("2016-08-02T20:52:11.379Z"),
                        "ipAddr" : "192.168.56.1",
                        "userAgent" : "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36"
                }
        },
        "rating" : 215
}
*/