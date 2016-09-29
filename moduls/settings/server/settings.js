initSettingsServer = function() {

initSettingsLib();

Meteor.methods({
	'settings.switchVacationMode': function(onVacation) {
		check(onVacation, Boolean);

		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		throw new Meteor.Error('Режим отпуска в разработке');

		Meteor.users.update({
			_id: user._id
		}, {
			$set: {
				onVacation: onVacation
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

		if (user.services && user.services.email && user.services.email.verificationTokens) {
			var tokens = user.services.email.verificationTokens;

			if (new Date() - new Date(tokens[tokens.length - 1].when) < (1000 * 60 * 60 * 24)) {
				throw new Meteor.Error('Письмо верификации можно отправить не чаще 2 раз в сутки.');
			}
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

	'settings.changeNotificationsSettings': function (field, value) {
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