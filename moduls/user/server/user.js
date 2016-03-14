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
	check(option.login, String);

	option.login = option.login.trim();

	check(option.login, Match.Where(function(login) {
		return login.length > 0 && login.length <= 16;
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


	check(option.code, String);
	var valid_code_id = Meteor.call('checkInviteCode', option.code);

	if (valid_code_id) {
		Invites.remove({_id: valid_code_id});
	} else {
		throw new Meteor.Error('Некорректный код приглашения');
	}
	user.inviteCode = option.code;


	user.login = option.login;
	user.planetName = (
		  letters[Math.floor(Math.random()*36)]
		+ letters[Math.floor(Math.random()*36)]
		+ letters[Math.floor(Math.random()*36)]
		+ '-'
		+ letters[Math.floor(Math.random()*36)]
		+ letters[Math.floor(Math.random()*36)]
		+ letters[Math.floor(Math.random()*36)]);

	user.game = {
		updated: Math.floor(new Date().valueOf() / 1000)
	};

	Game.Resources.initialize(user);
	Game.House.initialize(user);
	Game.Quest.initialize(user);

	Meteor.setTimeout(function(user) {
		Accounts.sendVerificationEmail(user._id);
	}.bind(this, user), 2000);

	return user;
})

//Accounts.config({sendVerificationEmail: true, forbidClientAccountCreation: false}); 


Meteor.methods({
	'totalUsersCount': function() {
		return Meteor.users.find().count();
	},

	'onlineUsersCount': function() {
		return Meteor.users.find({'status.online': true}).count();
	},

	'user.checkLoginExists': function(login) {
		check(login, String);

		if (Meteor.users.findOne({ login: login })) {
			return true;
		} else {
			return false;
		}
	}
});

});