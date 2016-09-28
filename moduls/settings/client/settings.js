initSettingsClient = function() {

initSettingsLib();

Game.Settings.showPage = function() {
	this.render('settings', { 
		to: 'content'
	});
};

Template.settings.events({
	'change [name="vacationMode"]': function(e, t) {
		if (e.target.checked) {
			var message = 'Вы уверены что хотите активировать Режим Отпуска? Вы не сможете снять его минимум 1 день, после чего Режим Отпуска будет заблокирован на 2 дня, максимальное время действия Режима Отпуска 30 дней. Во время Режима Отпуска ваши ресурсы не добываются, а на вас никто не может нападать. Активация этого режима не отменяет уже идущие на вас атаки.';

			Game.showAcceptWindow(message, function() {
				Meteor.call('settings.enableVacationMode', function(err) {
					if (err) {
						e.target.checked = false;
						return Notifications.error(err.message);
					}
					Notifications.success('Хорошего отпуска, Консул!');
				});	
			});
		} else {
			Meteor.call('settings.disableVacationMode', function(err) {
				if (err) {
					e.target.checked = true;
					return Notifications.error(err.message);
				}
				Notifications.success('С возвращением на службу, Консул!');
			});
		}
	}
});

Template.emailSettings.events({
	'click button[name="changeEmail"]': function() {
		var oldEmail = Meteor.user().emails[0].address;
		Game.showInputWindow('Введите новый email', oldEmail, function(email) {
			email = email.trim();
			if (email == oldEmail) {
				return;
			}
			Meteor.call('settings.changeEmail', oldEmail, email, function(err) {
				if (err) {
					return Notifications.error('Не получилось изменить email', err.message);
				}
				Notifications.success('Email успешно изменен');
			});
		});
	},

	'change input[name="subscribed"]': function(e, t) {
		var subscribed = e.target.checked;

		Meteor.call('settings.setSubscribed', e.target.dataset.email, subscribed, function(err) {
			if (err) {
				e.target.checked = !subscribed;
				return Notifications.error('Не удалось ' + (subscribed
					? 'подписаться на рассылку'
					: 'отписаться от рассылки'
				), err.message);
			}
			Notifications.success('Вы успешно ' + (subscribed
				? 'подписались на рассылку'
				: 'отписались от рассылки'
			));
		});
	},

	'click button[name="verify"]': function(e, t) {
		Meteor.call('settings.sendVerifyEmail', e.target.dataset.email, function(err) {
			if (err) {
				return Notifications.error('Не удалось отправить письмо верифицации.', err.message);
			}
			Notifications.success('Сообщение отправлено');
		});
	},

	'click .emailLettersFrequency button': function (e, t) {
		Meteor.call(
			'settings.setEmailLettersFrequency',
			e.target.dataset.frequency,
			function(err) {
				if (err) {
					return Notifications.error('Не удалось изменить частоту писем.', err.message);
				}
			}
		);
	}
});

Template.changePassword.events({
	'submit form': function(e, t) {
		e.preventDefault();

		var oldPassword = t.find('input[name="oldPassword"]').value;
		var newPassword = t.find('input[name="newPassword"]').value;
		var newPasswordRepeat = t.find('input[name="newPasswordRepeat"]').value;

		if (newPassword.length < 6) {
			return Notifications.error('Пароль должен содержать хотя бы 6 символов');
		}

		if (newPassword != newPasswordRepeat) {
			return Notifications.error('Пароли не совпадают');
		}

		Accounts.changePassword(oldPassword, newPassword, function(err){
			if (err) {
				return Notifications.error(err.message);
			}

			Notifications.success('Пароль успешно изменен');
			t.$('form')[0].reset();
		});
	}
});

Template.notificationsSettings.events({
	'change input[type="checkbox"]': function(e, t) {
		Meteor.call('settings.changeNotifications', e.target.dataset.settings_field, e.target.checked, function(err) {
			if (err) {
				e.target.checked = !e.target.checked;
				return Notifications.error('Не удалось изменить настройки.', err.message);
			}
			Notifications.success('Настройки успешно изменены.');
		});
	}
});


};