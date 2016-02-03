initHouseClient = function() {

initHouseLib();

Meteor.subscribe('houseItems');

Game.House.showPage = function() {

	var subgroup = this.params.subgroup;
	var item = this.params.item;

	if (subgroup) {

		if (!item) {
			item = _.keys(Game.House.items[subgroup])[0];
		}

		this.render('consulHouseItem', {
			to: 'content',
			data: {
				subgroup: subgroup,
				item: item
			}
		});
	} else {
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
		var items = [];
		var data = Game.House.getValue();
		
		for (var group in data) {
			if (!Game.House.items[group]) {
				continue;
			}

			for (var id in data[group]) {
				if (!Game.House.items[group][id]) {
					continue;
				}

				if (data[group][id].isPlaced) {
					items.push({
						group: group,
						id: id
					});
				}
			}
		}

		return items;
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

		var data = Game.House.getValue();
		var item = Game.House.items[group][id];

		var arrPrice = [];
		for (var key in item.price) {
			arrPrice.push({
				name: key,
				count: item.price[key]
			});
		}

		return {
			id: id,
			name: item.name,
			description: item.description,
			price: (arrPrice.length > 0 ? arrPrice : null),
			isPlaced: (data[group] && data[group][id] && data[group][id].isPlaced ? true : false),
			isBought: (data[group] && data[group][id] ? true : false),
			isNew: false
		}
	},

	items: function() {
		var result = [];

		var data = Game.House.getValue();
		var group = Template.instance().data.subgroup;
		var items = Game.House.items[group];

		for (var key in items) {
			result.push({
				id: key,
				isPlaced: (data[group] && data[group][key] && data[group][key].isPlaced) ? true : false,
				idBought: (data[group] && data[group][key]) ? true : false,
				idNew: false
			})
		}

		return result;
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