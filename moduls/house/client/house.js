initHouseClient = function() {

initHouseLib();

Meteor.subscribe('houseItems');

Game.House.showPage = function() {
	var subgroup = this.params.subgroup;
	var item = this.params.item;

	if (subgroup && !item) {
		item = _.keys(Game.House.items[subgroup])[0];
	}

	if (subgroup && item) {
		// show item menu
		this.render('consulHouseItem', {
			to: 'content',
			data: {
				subgroup: subgroup,
				item: item
			}
		});
	} else {
		// show consul house
		this.render('consulHouse', {
			to: 'content'
		});
	}
}

// ----------------------------------------------------------------------------
// Consul house overview
// ----------------------------------------------------------------------------

Template.consulHouse.helpers({
	items: function() {
		return Game.House.getPlacedItems();
	}
})

// ----------------------------------------------------------------------------
// Consul house item menu
// ----------------------------------------------------------------------------

Template.consulHouseItem.helpers({
	subgroup: function() {
		return Template.instance().data.subgroup;
	},

	item: function() {
		var group = Template.instance().data.subgroup;
		var id = Template.instance().data.item;
		return Game.House.items[group][id];
	},

	subgroupItems: function() {
		var group = Template.instance().data.subgroup;
		return _.map(Game.House.items[group], function(item) {
			return item;
		});
	}
})

Template.consulHouseItem.events({
	'click .buy': function(e, t) {
		var id = $(e.currentTarget).attr('data-id');
		Meteor.call('house.buyItem', t.data.subgroup, id);
	},

	'click .place': function(e, t) {
		var id = $(e.currentTarget).attr('data-id');
		Meteor.call('house.placeItem', t.data.subgroup, id);
	}
})

}