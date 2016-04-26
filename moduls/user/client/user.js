Template.auth.events({
	'submit form': function(e, t) {
		e.preventDefault();

		var email = t.find('input[name="username"]').value
		, password = t.find('input[name="password"]').value;

		Meteor.loginWithPassword(email, password, function(err){
			if (err){
				Notifications.error('Авторизация неудалась', err.error == 400 || err.error == 403 ? 'Неверный логин и/или пароль' : err.error);
			} else {
				Router.go('game');
			}
		});
		return false; 
	},

	'click .forgotPassword': function(e, t) {
		e.preventDefault();

		var email = prompt('Email?');

		if (email) {
			Accounts.forgotPassword({
				email: email
			}, function(err) {
				if (err) {
					Notifications.error('Восстановление пароля не дуалось', err.error);
				} else {
					Notifications.success('Способ восстановления кодов доступа отправлен на почту');
				}
			});
		}
	}
});


Template.register_window.created = function() {
	Session.set('register_step', '1');
	Session.set('register_points', 0);
};

Template.register_window.helpers({
	register_step: function() {
		return 'register_window_step' + Session.get('register_step');
	}
});

Template.register_window.events({
	'click a': function(e, t) {
		if (e.target.dataset.step) {
			e.preventDefault();

			if (e.target.dataset.points) {
				Session.set('register_points', Session.get('register_points') + 1);
			}

			Session.set('register_step', e.target.dataset.step);
		}
	}
});

Template.register_window_step3.helpers({
	err_username: function() {
		return Session.get('err_username');
	},
	err_password: function() {
		return Session.get('err_password');
	},
	err_passwordr: function() {
		return Session.get('err_passwordr');
	},
	err_email: function() {
		return Session.get('err_email');
	},
	err_rules: function() {
		return Session.get('err_rules');
	},
	err_code: function() {
		return Session.get('err_code');
	}
});

var validate_username = function(username) {
	if (username.length > 0) {
		Meteor.call('user.checkPlainnameExists', username, function(err, exists) {
			if (exists) {
				Session.set('err_username', 'Такой логин уже используется');
			} else {
				Session.set('err_username', false);
				return false;
			}
		});
	} else {
		Session.set('err_username', 'Логин должен содержать хотя бы 1 символ');
		return false;
	}
	return true;
};

var validate_password = function(password) {
	if (password.length > 5) {
		Session.set('err_password', false);
	} else {
		Session.set('err_password', 'Пароль должен содержать хотя бы 6 символов');
		return false;
	}
	return true;
};

var validate_passwordr = function(password, passwordr) {
	if (passwordr == password) {
		Session.set('err_passwordr', false);
	} else {
		Session.set('err_passwordr', 'Пароли не совпадают');
		return false;
	}
	return true;
};

var validate_email = function(email) {
	if (email.indexOf('@') != -1) {
		Session.set('err_email', false);
	} else {
		Session.set('err_email', 'Это точно email?');
		return false;
	}
	return true;
};

var validate_rules = function(rules) {
	if (rules) {
		Session.set('err_rules', false);
	} else {
		Session.set('err_rules', 'Соглашайтесь!');
		return false;
	}
	return true;
};

Template.register_window_step3.events({
	'click .show-agreement': function(e, t) {
		e.preventDefault();
		t.$('.agreement').show();
	},

	'click .hide-agreement': function(e, t) {
		e.preventDefault();
		t.$('.agreement').hide();
	},

	'submit form': function(e, t) {
		e.preventDefault();

		var username = t.find('input[name="username"]').value
		  , email = t.find('input[name="email"]').value
		  , password = t.find('input[name="password"]').value
		  , passwordr = t.find('input[name="passwordr"]').value
		  , code = t.find('input[name="code"]').value
		  , rules = t.find('input[name="rules"]').checked;

		if (validate_username(username) 
			&& validate_password(password)
			&& validate_passwordr(password, passwordr)
			&& validate_email(email)
			&& validate_rules(rules)) {

			Meteor.call('checkInviteCode', code, function(error, result) {
				if (result) {
					Session.set('err_code', false);
					Accounts.createUser({email: email, password: password, username: username, code: code}, function(err) {
						if (err) {
							Notifications.error('Не удалось зарегистрировать пользователя', err.error);
						} else {
							Session.set('register_step', 4);
						}
					});
				} else {
					Session.set('err_code', '<a href="https://boomstarter.ru/projects/zav/57753">Неверный код</a>');
				}
			});
		}

		return false;
	},

	'blur [name="username"]': function(e, t) {
		var username = e.target.value;
		validate_username(username);
	},

	'blur [name="password"]': function(e, t) {
		var password = e.target.value;
		validate_password(password);
	},

	'blur [name="passwordr"]': function(e, t) {
		var passwordr = e.target.value
		  , password = t.find('input[name="password"]').value;
		validate_passwordr(password, passwordr);
	},

	'blur [name="email"]': function(e, t) {
		var email = e.target.value;
		validate_email(email);
	}
});

Template.register_window_step7.helpers({
	points: function() {
		return Session.get('register_points');
	}
});