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

	'settings.sendVerifyEmail': function() {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		Accounts.sendVerificationEmail(user._id, user.emails[0].address);
	},

	'settings.changeEmail': function(newEmail) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		var oldEmail = user.emails[0];

		if (oldEmail.verified) {
			throw new Meteor.Error('Нельзя изменить верифицированный email.');
		}

		Accounts.addEmail(user._id, newEmail);
		Accounts.removeEmail(user._id, oldEmail.address);
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