initItemLib = function() {

game.IconGroup = function(options) {
	this.engName = options.engName;
	this.name = options.name;

	this.isDefault = options.isDefault;
	this.isUnique = options.isUnique;
	this.price = options.price;

	if (Game.Icons.items[this.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется группа иконок ' + this.engName);
	}

	Game.Icons.items[this.engName] = this;

	this.icons = {};

	for (var i = 0; i < options.icons.length; i++) {
		new game.Icon(this, options.icons[i]);
	}
};

game.Icon = function(group, options) {
	this.group = group.engName;
	this.engName = options.engName;
	this.requirements = options.requirements;

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

		var value = Game.Icons.getValue();
		if (value && value[this.group] && value[this.group].indexOf(this.engName) != -1) {
			return true;
		}

		return false;
	};

	this.meetRequirements = function() {
		return this.requirements === undefined || (this.requirements && this.requirements.rank <= Game.User.getLevel());
	};

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
			var value = Game.Icons.getValueUnique();
			if (value && value[this.group] && value[this.group][this.engName]) {
				return true;
			}
		}
		return false;
	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

Game.Icons = {
	Collection: new Meteor.Collection('icons'),

	items: {},

	getIcon: function(group, engName) {
		if (Game.Icons.items[group]) {
			return Game.Icons.items[group].icons[engName];
		}
		return null;
	},

	getValue: function() {
		return Game.Icons.Collection.findOne({
			user_id: Meteor.userId()
		});
	},

	getValueUnique: function() {
		return Game.Icons.Collection.findOne({
			user_id: 'unique'
		});
	}
};

initIconsContent();

}