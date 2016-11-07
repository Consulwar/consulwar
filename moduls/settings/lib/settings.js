initSettingsLib = function() {


Game.Settings = {
	emailLettersFrequency: [
		{title:'1 день', engName: 'everyDay'},
		{title:'3 дня', engName: 'everyThreeDays'},
		{title:'7 дней', engName: 'everySevenDays'},
		{title:'1 месяц', engName: 'everyMonth'},
		{title:'только акции', engName: 'onlyPromotion'},
		{title:'только рестарт игры', engName: 'onlyRestart'}
	],

	notificationFields: ['showDesktopNotifications', 'notShowQuestsDuringActivation'],

	options: {
		hideDescription: [true, false],
		hideFleetInfo: [true, false]
	}
};


};