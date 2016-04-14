initBuildingClient = function() {

initBuildingLib();

Meteor.subscribe('buildings');

Game.Building.showPage = function() {
	var item = Game.Building.items[this.params.group][this.params.item];
	
	if (item) {
		this.render('item_building', {to: 'content', data: {building: item}});
		this.render(null, { to: 'buildingMenu' });
	} else {
		this.render('empty', {to: 'content'})
	}
}

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

		if (item.currentLevel() == 0) {
			Router.go(item.url({group: item.group}));
		}
	},

	'click button.market': function(e, t) {
		Game.Market.showWindow();
	},

	'click button.tournament': function(e, t) {
		Game.Colosseum.showTournaments();
	},

	'click button.blackmarket': function(e, t) {
		Game.Blackmarket.showItems();
	}
});

}