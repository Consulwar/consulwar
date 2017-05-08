Meteor.startup(function() {
'use strict';

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
	Accounts.emailTemplates.verifyEmail.html = function(user, url) {
		var unsubscribeUrl = 'http://consulwar.ru/unsubscribe@mail=' + user.emails[0].address;
		var html = '<p>Нажав на эту ссылку, вы подтверждаете, что данная почта недоступна Рептилоидам, что канал связи с параллельной вселенной защищён и вы, истинно Великий Консул - являетесь единственным пользователем данного аккаунта. Удачи в Бою и да прибудет с вами Летающий Макаронный Монстр.: ';
		html += '<a href="' + url + '">' + url + '</a></p>';
		html += '<p>Этот адрес электронной почты был получен нами после вашей регистрации в игре ConsulWar и подключения к каналу связи. Это письмо вы получили, так как был запущен новый сервер и открыт новый канал связи.</p>';
		html += '<p>Если вас больше не интересует спасение параллельной вселенной, и вы больше не хотите получать рассылку от проекта ConsulWar, нажмите на ссылку: ';
		html += '<a href="' + unsubscribeUrl + '">' + unsubscribeUrl + '</a></p>';
		html += '<p>После этого вы перестанете получать письма от проекта ConsulWar</p>';
		return html;
	};

	Accounts.emailTemplates.resetPassword.subject = function (user) {
		return 'Сброс пароля';
	};

	Accounts.emailTemplates.resetPassword.html = function (user, url) {
		var unsubscribeUrl = 'http://consulwar.ru/unsubscribe@mail=' + user.emails[0].address;
		var html = '<p>Чтобы сбросить пароль нажмите на ссылку: ';
		html += '<a href="' + url + '">' + url + '</a></p>';
		html += '<p>Этот адрес электронной почты был получен нами после вашей регистрации в игре ConsulWar и подключения к каналу связи. Это письмо вы получили, так как был запущен новый сервер и открыт новый канал связи.</p>';
		html += '<p>Если вас больше не интересует спасение параллельной вселенной, и вы больше не хотите получать рассылку от проекта ConsulWar, нажмите на ссылку: ';
		html += '<a href="' + unsubscribeUrl + '">' + unsubscribeUrl + '</a></p>';
		html += '<p>После этого вы перестанете получать письма от проекта ConsulWar</p>';
		return html;
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

var tempKey = uuid.new();

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

		var ipAddress = Meteor.call('user.getIpAddress', tempKey);
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

if (!Meteor.settings.public.isInviteRequired) {
	if (!Meteor.settings.recaptcha.privatekey
	 || !Meteor.settings.public.recaptcha.publickey
	) {
		throw new Meteor.Error('Ошибка в настройках', 'Не заполнены ключи для recaptcha (см. settings.sample recaptcha)');
	}

	reCAPTCHA.config({
		privatekey: Meteor.settings.recaptcha.privatekey
	});
}

Meteor.methods({
	'totalUsersCount': function() {
		Game.Log('user.totalUsersCount', this.connection.clientAddress);
		return Meteor.users.find().count();
	},

	'onlineUsersCount': function() {
		Game.Log('user.onlineUsersCount', this.connection.clientAddress);
		return Meteor.users.find({'status.online': true}).count();
	},

	'user.getIpAddress': function(key) { // TODO: Подумать как избавиться от этого метода!
		Game.Log('user.getIpAddress', this.connection.clientAddress);
		if (key != tempKey) {
			return null;
		}
		return this.connection.clientAddress;
	},

	'user.checkUsernameExists': function(username) {
		Game.Log('user.checkUsernameExists', this.connection.clientAddress);

		check(username, String);

		if (Meteor.users.findOne({ username: username })) {
			return true;
		} else {
			return false;
		}
	},

	'user.checkPlainnameExists': function(username) {
		Game.Log('user.checkPlainnameExists', this.connection.clientAddress);

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

		Game.Log.method('user.changePlanetName');

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