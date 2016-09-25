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
			alert("В отпуск!");
		}
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

			Notifications.success("Пароль успешно изменен");
			t.$("form")[0].reset();
		});
	}
});


};