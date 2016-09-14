initBuildingsClient = function() {

initBuildingsLib();

Meteor.subscribe('buildings');

Game.Building.showPage = function() {
	var item = Game.Building.items[this.params.group][this.params.item];
	var menu = this.params.menu;
	
	if (item) {
		switch (menu) {
			case 'tournaments':
				this.render('colosseum', { to: 'content' });
				break;
			case 'bonus':
				this.render('pulsecatcher', { to: 'content' });
				break;
			default:
				this.render('item_building', {to: 'content', data: { building: item } });
				break;
		}
	} else {
		this.render('empty', { to: 'content' });
	}
};

Template.item_building.events({
	'click button.build': function(e, t) {
		var item = t.data.building;

		Meteor.call('building.build', {
				group: item.group,
				engName: item.engName
			},
			function(error, message) {
				if (error) {
					Notifications.error('Невозможно начать строительство', error.error);
				} else {
					Notifications.success('Строительство запущено');
				}
			}
		);

		if (item.currentLevel() === 0) {
			Router.go(item.url({group: item.group}));
		}
	},

	'click button.market': function(e, t) {
		Game.Building.special.Market.showWindow();
	},

	'click button.containers': function(e, t) {
		Game.Containers.showWindow();
	}
});


initBuildingsSpecialMarketClient();
initBuildingsSpecialColosseumClient();
initBuildingsSpecialContainersClient();
initBuildingsSpecialPulsecatcherClient();

};