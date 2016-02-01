initHouseClient = function() {

initHouseLib();

Meteor.subscribe('houseItems');

Game.House.showPage = function() {

	var item = this.params.item;

	if (item) {
		this.render('consulHouseItem', {
			to: 'content',
			data: {
				name: item,
				id: new ReactiveVar( _.keys(Game.House.items[item].types)[0] )
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

Tracker.autorun(function() {
	var data = Game.House.getValue();
	for (var key in Game.House.items) {
		Game.House.items[key].refreshEffects();
	}
})

Template.consulHouse.helpers({
	items: function() {
		var items = [];
		var data = Game.House.getValue();
		
		for (var group in data) {
			if (!Game.House.items[group]) {
				continue;
			}

			for (var id in data[group]) {
				if (!Game.House.items[group].types[id]) {
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
	group: function() {
		return Template.instance().data.name;
	},

	id: function() {
		return Template.instance().data.id.get();
	},

	item: function() {
		var name = Template.instance().data.name;
		var id = Template.instance().data.id.get();

		var data = Game.House.getValue();
		var item = Game.House.items[name].types[id];

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
			isPlaced: (data[name] && data[name][id] && data[name][id].isPlaced ? true : false),
			isBought: (data[name] && data[name][id] ? true : false),
			isNew: false
		}
	},

	items: function() {
		var result = [];

		var data = Game.House.getValue();
		var name = Template.instance().data.name;
		var types = Game.House.items[name].types;

		for (var key in types) {
			result.push({
				id: key,
				isPlaced: (data[name] && data[name][key] && data[name][key].isPlaced) ? true : false,
				idBought: (data[name] && data[name][key]) ? true : false,
				idNew: false
			})
		}

		return result;
	}
})

Template.consulHouseItem.events({
	'click .consul-items li': function(e, t) {
		var id = $(e.currentTarget).attr('data-id');
		t.data.id.set( id );
	},

	'click .buy': function(e, t) {
		var id = $(e.currentTarget).attr('data-id');
		Meteor.call('house.buyItem', t.data.name, id);
	},

	'click .place': function(e, t) {
		var id = $(e.currentTarget).attr('data-id');
		Meteor.call('house.placeItem', t.data.name, id);
	}
})

}