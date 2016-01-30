initHouseClient = function() {

initHouseLib();

Meteor.subscribe('houseItems');

Game.House.showPage = function() {

	var item = this.params.item;

	if (item) {
		this.render('consulHouseItem', {
			to: 'content',
			data: {
				name: item
			}
		});
	} else {
		this.render('consulHouse', {
			to: 'content'
		});
	}
}

var items = [];

var getItem = function(id) {
	for (var i = 0; i < items.length; i++) {
		if (items[i].engName == id) {
			return items[i];
		}
	}
	return {};
}

var selectItem = function(id) {
	Session.set('house_item', getItem(id));
}

var buyItem = function(id) {

	Meteor.call('houseItems.buy', 'chairs', id);

	getItem(id).isBought = true;
	Session.set('house_items', items);
	Session.set('house_item', getItem(id));
}

var placeItem = function(id) {

	Meteor.call('houseItems.place', 'chairs', id);

	for (var i = 0; i < items.length; i++) {
		items[i].isPlaced = false;
	}
	getItem(id).isPlaced = true;
	Session.set('house_items', items);
	Session.set('house_item', getItem(id));
}

var removeItem = function(id) {

	Meteor.call('houseItems.remove', 'chairs', id);

	getItem(id).isPlaced = false;
	Session.set('house_items', items);
	Session.set('house_item', getItem(id));
}

Template.consulHouse.onRendered(function() {

	items = Game.HouseItems.items['chairs'];
	items[10].isNew = true;
	items[11].isNew = true;
	items[12].isNew = true;

	// TODO: maybe observe?
	var data = Game.HouseItems.getValue();
	if (data && data['chairs']) {
		for (var key in data['chairs']) {
			for (var i = 0; i < items.length; i++) {
				if (items[i].engName == key) {
					items[i].isBought = true;
					items[i].isPlaced = data['chairs'][key].isPlaced;
				}
			}
		}
	}

	Session.set('house_items', items);
	Session.set('house_item', items[0]);

});

Template.consulHouse.helpers({

	'house_items': function() {
		return Session.get('house_items');
	},

	'house_item': function() {
		return Session.get('house_item');
	},

	'placed_items': function() {
		return false;
		//return Game.HouseItems.getPlaced();
	}

});

Template.consulHouse.events({

	'click .consul-items li': function(e) {
		var id = $(e.currentTarget).attr('data-id');
		selectItem(id);
	},

	'click .buy': function(e) {
		var id = $(e.currentTarget).attr('data-id');
		buyItem(id);
	},

	'click .place': function(e) {
		var id = $(e.currentTarget).attr('data-id');
		placeItem(id);
	},

	'click .remove': function(e) {
		var id = $(e.currentTarget).attr('data-id');
		removeItem(id);
	}

})

}