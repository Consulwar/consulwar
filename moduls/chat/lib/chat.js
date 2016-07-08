initChatLib = function() {

Game.Chat = {};

Game.Chat.Messages = {
	LOAD_COUNT: 20,
	LIMIT: 1000,
	FREE_CHAT_PRICE: 5000,

	Collection: new Meteor.Collection('messages'),

	getPrice: function(room) {
		var user = Meteor.user();

		if (user.isChatFree) {
			return null;
		}

		if (user.role && ['admin', 'helper'].indexOf(user.role) != -1) {
			return null;
		}

		if (room) {
			if (room.isFree) {
				return null;
			}

			if (room.isOwnerPays) {
				return { credits: 1 };
			}
		}

		var income = Math.floor(Game.Resources.getIncome().crystals / 30);
		var basePrice = { 
			crystals: Math.ceil(Math.max(Math.min(income, 10000), 100))
		};

		return Game.Effect.Price.applyTo({ engName: 'message' }, basePrice, true);
	}
};

Game.Chat.Room = {
	USERS_LIMIT: 50,
	MODERATORS_LIMIT: 10,

	Collection: new Meteor.Collection('chatRooms'),

	getPrice: function(room) {
		var user = Meteor.user();

		if (user.role && ['admin'].indexOf(user.role) != -1) {
			return null;
		}

		if (room.isPublic) {
			return room.isOwnerPays ? { credits: 2500 } : { credits: 5000 };
		}

		return room.isOwnerPays ? { credits: 500 } : { credits: 1000 };
	}
};

game.ChatIconGroup = function(options) {
	this.engName = options.engName;
	this.name = options.name;

	this.isDefault = options.isDefault;
	this.isUnique = options.isUnique;
	this.price = options.price;

	this.requirements = options.requirements;

	if (Game.Chat.Icons.items[this.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется группа иконок чата ' + this.engName);
	}

	Game.Chat.Icons.items[this.engName] = this;

	this.icons = {};

	for (var i = 0; i < options.icons.length; i++) {
		new game.ChatIcon(this, options.icons[i]);
	}
};

game.ChatIcon = function(group, options) {
	this.group = group.engName;
	this.engName = options.engName;

	if (group.icons[this.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется иконка в группе ' + this.group);
	}

	group.icons[this.engName] = this;

	this.isDefault = (options.isDefault !== undefined) ? options.isDefault : group.isDefault;
	this.isUnique = (options.isUnique !== undefined) ? options.isUnique : group.isUnique;
	this.price = (options.price !== undefined) ? options.price : group.price;

	this.checkHas = function() {
		if (this.isDefault) {
			return true;
		}

		var value = Game.Chat.Icons.getValue();
		if (value && value[this.group] && value[this.group].indexOf(this.engName) != -1) {
			return true;
		}

		return false;
	};

	this.meetRequirements = function() {
		return this.requirements && this.requirements.rank <= Game.User.getLevel();
	}

	this.canBuy = function() {
		if (this.isDefault) {
			return false;
		}

		if (this.checkHas()) {
			return false;
		}

		if (this.checkUniqueSold()) {
			return false;
		}

		if (!this.price) {
			return false;
		}

		if (!this.meetRequirements()) {
			return false;
		}

		var resources = Game.Resources.getValue();
		for (var name in this.price) {
			if (name != 'time' && resources[name].amount < (this.price[name])) {
				return false;
			}
		}

		return true;
	};

	this.checkUniqueSold = function() {
		if (this.isUnique) {
			var value = Game.Chat.Icons.getValueUnique();
			if (value && value[this.group] && value[this.group][this.engName]) {
				return true;
			}
		}
		return false;
	};

	this.checkSelected = function() {
		var user = Meteor.user();
		if (user.settings
		 && user.settings.chat
		 && user.settings.chat.icon == this.group + '/' + this.engName
		) {
			return true;
		}
		return false;
	};
};

Game.Chat.Icons = {
	Collection: new Meteor.Collection('chatIcons'),

	items: {},

	getIcon: function(group, engName) {
		if (Game.Chat.Icons.items[group]) {
			return Game.Chat.Icons.items[group].icons[engName];
		}
		return null;
	},

	getValue: function() {
		return Game.Chat.Icons.Collection.findOne({
			user_id: Meteor.userId()
		});
	},

	getValueUnique: function() {
		return Game.Chat.Icons.Collection.findOne({
			user_id: 'unique'
		});
	}
};

initChatContent();

};