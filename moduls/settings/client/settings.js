initSettingsClient = function() {

initSettingsLib();

Game.Settings.showPage = function() {
	this.render('settings', { to: 'content' });
};

Template.settings.events({
	'click .changeAvatar': function(e, t) {
		Game.Chat.showIconsWindow();
	},
});

Template.emailSettings.events({
	'click button[name="changeEmail"]': function(e, t) {
		var currentEmail = Meteor.user().emails[0].address;
		Game.showInputWindow('Введите новый email', currentEmail, function(email) {
			email = email.trim();
			if (email == currentEmail) {
				return;
			}
			Meteor.call('settings.changeEmail', currentEmail, email, function(err) {
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
				return Notifications.error(
					'Не удалось ' + (subscribed ? 'подписаться на рассылку' : 'отписаться от рассылки'),
					err.message
				);
			}
			Notifications.success(
			 'Вы успешно ' + 
			 (subscribed ? 'подписались на рассылку' : 'отписались от рассылки')
			);
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
		Meteor.call('settings.setEmailLettersFrequency', e.target.dataset.frequency, function(err) {
			if (err) {
				return Notifications.error('Не удалось изменить частоту писем.', err.message);
			}
			Notifications.success('Частота писем успешно изменена.');
		});
	}
});

Template.changePassword.events({
	'submit form': function(e, t) {
		e.preventDefault();

		var currentPassword = t.find('input[name="currentPassword"]').value;
		var newPassword = t.find('input[name="newPassword"]').value;
		var newPasswordRepeat = t.find('input[name="newPasswordRepeat"]').value;

		if (newPassword.length < 6) {
			return Notifications.error('Пароль должен содержать хотя бы 6 символов');
		}

		if (newPassword != newPasswordRepeat) {
			return Notifications.error('Пароли не совпадают');
		}

		Accounts.changePassword(currentPassword, newPassword, function(err){
			if (err) {
				return Notifications.error(err.message);
			}

			Notifications.success('Пароль успешно изменен');
			t.$('form')[0].reset();
		});
	}
});

Template.notificationsSettings.events({
	'change input[data-settings_field="showDesktopNotifications"]': function(e, t) {
		var field = e.target.dataset.settings_field;

		if (!Notification) {
			e.target.checked = false;
			Notifications.error('Уведомления на рабочий стол не поддерживаются вашим браузером');
		} else if (Notification.permission == 'granted') {
			Meteor.call('settings.changeNotificationsSettings', field, e.target.checked, function(err) {
				if (err) {
					e.target.checked = !e.target.checked;
					return Notifications.error('Не удалось изменить настройки.', err.message);
				}
				Notifications.success('Настройки успешно изменены.');
			});
		} else if (Notification.permission == 'denied') {
			e.target.checked = false;
			Notifications.error('Сначала разрешите уведомления в настройках браузера.');
		} else if (Notification.permission == 'default') {
			Notification.requestPermission(function(permission) {
				if (permission != 'granted') {
					e.target.checked = false;
					Notifications.error('Сначала разрешите уведомления в настройках браузера');
					return;
				}
				Meteor.call('settings.changeNotificationsSettings', field, true, function(err) {
					if (err) {
						Notifications.error('Не удалось изменить настройки.', err.message);
						return;
					}
					Notifications.success('Настройки успешно изменены.');
				});
			});
		}
	},

	'change input[data-settings_field="showQuestsDuringActivation"]': function(e, t) {
		var field = 'notShowQuestsDuringActivation';
		Meteor.call('settings.changeNotificationsSettings', field, !e.target.checked, function(err) {
			if (err) {
				e.target.checked = !e.target.checked;
				return Notifications.error('Не удалось изменить настройки.', err.message);
			}
			Notifications.success('Настройки успешно изменены.');
		});
	}
});


};