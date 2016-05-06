Meteor.startup(function() {

if (Meteor.settings.mail) {

	process.env.MAIL_URL = Meteor.settings.mail.protocol + '://' + encodeURIComponent(Meteor.settings.mail.username) + ':' + encodeURIComponent(Meteor.settings.mail.password) + '@' + encodeURIComponent(Meteor.settings.mail.server) + ':' + Meteor.settings.mail.port;

	// By default, the email is sent from no-reply@meteor.com. If you wish to receive email from users asking for help with their account, be sure to set this to an email address that you can receive email at.
	Accounts.emailTemplates.from = Meteor.settings.mail.from;

	// The public name of your application. Defaults to the DNS name of the application (eg: awesome.meteor.com).
	Accounts.emailTemplates.siteName = Meteor.settings.mail.sitename;

	// A Function that takes a user object and returns a String for the subject line of the email.
	Accounts.emailTemplates.verifyEmail.subject = function(user) {
		return 'Подтверждение почты';
	};

	// A Function that takes a user object and a url, and returns the body text for the email.
	// Note: if you need to return HTML instead, use Accounts.emailTemplates.verifyEmail.html
	Accounts.emailTemplates.verifyEmail.text = function(user, url) {
		return 'Нажав на эту ссылку, вы подтверждаете, что данная почта недоступна Рептилоидам, что канал связи с параллельной вселенной защищён и вы, истинно Великий Консул - являетесь единственным пользователем данного аккаунта. Удачи в Бою и да прибудет с вами Летающий Макаронный Монстр.: ' + url;
	};

} else if (process.env.NODE_ENV != 'development') {
	throw Error('Не установлены настройки почты');
}

var letters = [
	'A', 'B', 'C', 'D', 'E', 'F',
	'G', 'H', 'I', 'J', 'K', 'L',
	'M', 'N', 'O', 'P', 'Q', 'R',
	'S', 'T', 'U', 'V', 'W', 'X',
	'Y', 'Z', '0', '1', '2', '3', 
	'4', '5', '6', '7', '8', '9'
];

Accounts.onCreateUser(function(option, user) {
	check(option.username, String);

	option.username = option.username.trim();
	option.username = option.username.replace(/\s+/g, ' ');

	check(option.username, Match.Where(function(username) {
		if (username.length === 0) {
			throw new Meteor.Error('Имя не должно быть пустым');
		}

		if (username.length > 16) {
			throw new Meteor.Error('Максимальная длинна имени 16 символов');
		}

		if (!username.match(/^[а-яА-Яa-zA-Z0-9_\- ]+$/)) {
			throw new Meteor.Error('Имя может содержать пробел, тире, нижнее подчеркивание, буквы и цифры');
		}

		var hasName = Meteor.call('user.checkPlainnameExists', option.username);
		if (hasName) {
			throw new Meteor.Error('Такое имя занято');
		}

		return true;
	}));

	check(option.email, Match.Where(function(email) {
		var hasEmail = Meteor.users.findOne({
			emails: {
				$elemMatch: {
					address: email
				}
			}
		});

		if (hasEmail) {
			throw new Meteor.Error('Такой Email Занят');
		}
		return true;
	}));

	if (Meteor.settings.public.isInviteRequired) {

		// registration by invite
		check(option.code, String);
		var valid_code_id = Meteor.call('user.checkInviteCode', option.code);

		if (valid_code_id) {
			Invites.remove({ _id: valid_code_id });
			user.inviteCode = option.code;
		} else {
			throw new Meteor.Error('Некорректный код приглашения');
		}

	} else {

		// registration by captcha
		check(option.captcha, String);

		var ipAddress = Meteor.call('user.getIpAddress', Meteor.settings.recaptcha.privatekey);
		var recaptchaResponse = reCAPTCHA.verifyCaptcha(ipAddress, option.captcha);

		if (!recaptchaResponse.success) {
			throw new Meteor.Error('Вы робот');
		}

	}

	user.username = option.username;
	user.plain_username = Game.User.convertUsernameToPlainname(option.username);
	user.planetName = (
		  letters[Math.floor(Math.random()*36)]
		+ letters[Math.floor(Math.random()*36)]
		+ letters[Math.floor(Math.random()*36)]
		+ '-'
		+ letters[Math.floor(Math.random()*36)]
		+ letters[Math.floor(Math.random()*36)]
		+ letters[Math.floor(Math.random()*36)]);

	user.game = {
		updated: Game.getCurrentTime()
	};

	Game.Resources.initialize(user);
	Game.House.initialize(user);
	Game.Quest.initialize(user);
	Game.Statistic.initialize(user);

	Meteor.setTimeout(function(user) {
		Accounts.sendVerificationEmail(user._id);
	}.bind(this, user), 2000);

	return user;
});

//Accounts.config({sendVerificationEmail: true, forbidClientAccountCreation: false}); 

reCAPTCHA.config({
	privatekey: Meteor.settings.recaptcha.privatekey
});

Meteor.methods({
	'totalUsersCount': function() {
		return Meteor.users.find().count();
	},

	'onlineUsersCount': function() {
		return Meteor.users.find({'status.online': true}).count();
	},

	'user.getIpAddress': function(key) { // TODO: Подумать как избавиться от этого метода!
		if (key != Meteor.settings.recaptcha.privatekey) {
			return null;
		}
		return this.connection.clientAddress;
	},

	'user.checkUsernameExists': function(username) {
		check(username, String);

		if (Meteor.users.findOne({ username: username })) {
			return true;
		} else {
			return false;
		}
	},

	'user.checkPlainnameExists': function(username) {
		check(username, String);

		var plainname = Game.User.convertUsernameToPlainname(username);
		if (Meteor.users.findOne({ plain_username: plainname })) {
			return true;
		} else {
			return false;
		}
	},

	'user.changePlanetName': function(name) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('user.changePlanetName: ', new Date(), user.username);

		check(name, String);
		name = name.trim();

		if (name.length === 0) {
			throw new Meteor.Error('Имя планеты не должно быть пустым');
		}

		if (name.length > 16) {
			throw new Meteor.Error('Максимум 16 символов');
		}

		Meteor.users.update({
			_id: Meteor.userId()
		}, {
			$set: {
				planetName: name
			}
		});

		Game.Planets.Collection.update({
			user_id: Meteor.userId(),
			isHome: true
		}, {
			$set: {
				name: name
			}
		});
	}
});

});