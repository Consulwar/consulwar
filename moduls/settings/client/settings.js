initSettingsClient = function() {

initSettingsLib();

Game.Settings.showPage = function() {
	this.render('settings', { 
		to: 'content'
	});
};

};