game = {
	PRODUCTION_FACTOR: 1.48902803168182,
	PRICE_FACTOR: 1.568803194,

	planet: {
		residential: {}, 
		counsul: {}, 
		military: {}
	},
	army: {
		fleet: {},
		heroes: {},
		ground: {}
	},
	research: {
		evolution: {},
		fleetups: {},
		mutual: {}
	},
	powerups: {
		avaliable: {},
		activated: {},
		bought: {}
	},
	alliance: {
		info: {},
		find: {},
		create: {}
	},
	battle: {
		reptiles: {},
		reinforcement: {},
		statistics: {},
		earth: {}
	},
	/*battle: {
		events: {},
		reinforcement: {},
		history: {}
	},*/
	messages: {
		'private': {},
		alliance: {},
		all: {}
	},
	reptiles: {
		rfleet: {},
		rheroes: {},
		rground: {}
	},

	setToMenu: '',
	setToSide: '',

	hasArmy: function() {
		var army = Game.Unit.getValue();

		if (army && army.ground) {

			for (var name in army.ground) {
				if (army.ground[name] > 0) {
					return true;
				}
			}
		}
		return false;
	},

	hasFleet: function() {
		var army = Game.Unit.getValue();

		if (army && army.fleet) {

			for (var name in army.fleet) {
				if (army.fleet[name] > 0) {
					return true;
				}
			}
		}
		return false;
	}
};

game.Item = function(options) {
	this.constructor = function(options) {
		var self = this;

		this.name = options.name;
		this.engName = options.engName;

		if (options.effect && options.effect.register) {
			options.effect.register(this);
		}

		this.effect = options.effect;
		if (options.effect && options.effect.result) {
			this.effect.result = options.effect.result.bind(this);
		}
		this.description = options.description;
		this.basePrice = options.basePrice;
		this.maxLevel = options.maxLevel;

		//this.requirements = options.requirements;
		Object.defineProperty(this, 'requirements', {
			get: function() {
				return typeof options.requirements == 'function' ? options.requirements.call(self) : [];
			},
			enumerable: true
		});

		if (options.targets) {
			//this.targets = options.targets;
			Object.defineProperty(this, 'targets', {
				get: function() {
					//var characteristics = Game.Effect.Military.applyTo(this, _.clone(options.characteristics), false);
					//characteristics.base = options.characteristics;

					return options.targets;
				},
				enumerable: true
			});
		}
		
		if (options.characteristics) {
			Object.defineProperty(this, 'characteristics', {
				get: function() {
					var characteristics = Game.Effect.Military.applyTo(this, _.clone(options.characteristics), false);
					characteristics.base = options.characteristics;

					return characteristics;
				},
				enumerable: true
			});
		}

		this.triggers = options.triggers;

		this.menu = game.setToMenu;
		this.side = game.setToSide;


		this.group = options.group || this.side;

		//game[this.menu][this.side][this.engName] = this;
	}

	this.constructor(options);

	this.currentLevel = function() {
		return Game.getObjectByType(this.type).get(this.group, this.engName);
	}

	this.price = function(level) {
		var curPrice = {};
		if (this.type != 'unit'
		 && this.type != 'reptileUnit'
		 && this.type != 'mutual'
		) {
			// Цена идет на подъем ДО указаного уровня с предыдущего
			// т.к. начальный уровень нулевой, то цена для первого уровня
			// является ценой подъема с нулевого до первого
			level = level ? level - 1 : this.currentLevel();

			curPrice.time = 0;

			for (var name in this.basePrice) {
				curPrice[name] = Math.floor(this.basePrice[name] * Math.pow(game.PRICE_FACTOR, level));
				curPrice.time += curPrice[name];
			}

			if (level > 9 && !curPrice.honor) {
				curPrice.honor = curPrice.humans * 3;
				delete curPrice.humans;
			}

			curPrice.time = Math.floor(curPrice.time / 12);
		} else {
			level = level ? level : 1;

			for (var name in this.basePrice) {
				curPrice[name] = this.basePrice[name] * level;
			}
		}

		Object.defineProperty(curPrice, 'base', {
			value: _.clone(curPrice)
		})

		curPrice = Game.Effect.Price.applyTo(this, curPrice);

		return curPrice;
	}

	this.next = {
		price: (function(level) {
			level = (level || this.currentLevel()) + 2;

			return this.price(level);
		}).bind(this)
	}

	this.progress = function() {
		var progressItem = Game.Queue.getGroup(this.group);

		if (progressItem && progressItem.engName == this.engName) {
			return progressItem;
		} else {
			return false;
		}
	}

	this.isEnoughResources = function(count, currency) {
		if (count == undefined) {
			if (this.type == 'unit' || this.type == 'mutual') {
				count = 1;
			} else {
				count = this.currentLevel() + 1;
			}
		}
		var user = Meteor.user();
		var price = this.price(count);

		if (currency) {
			if (currency == 'credits') {
				price = {
					credits: price.credits
				}
			} else {
				delete price.credits;
			}
		}

		var resources = Game.Resources.getValue();

		for (var name in price) {
			if (name != 'time' && resources[name].amount <= (price[name])) {
				return false;
			}
		}
		return true;
	}

	this.meetRequirements = function() {
		if (this.requirements) {
			for (var key in this.requirements) {
				if (!this.requirements[key][0].has(this.requirements[key][1])) {
					return false;
				}
			}
		}
		return true;
	}

	this.canBuild = function(count, currency) {
		if (currency 
			&& (
				(currency == 'credits' && this.basePrice.credits) 
				|| (currency == 'resources' && (this.basePrice.metals || this.basePrice.crystals || this.basePrice.humans)))) {
			return this.meetRequirements() && this.isEnoughResources(count, currency);
		}

		return this.meetRequirements() && this.isEnoughResources(count) && !Game.Queue.getGroup(this.group);
	}

	this.has = function(level) {
		level = level || 1;
		return (this.currentLevel() >= level);
	}
}

function extend(Child, Parent) {
	var F = function() {};
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;

	for (var something in Parent) {
		if (something != 'superclass') {
			Child[something] = Parent[something];
		}
	}
}

game.extend = extend;


Game = {
	PRODUCTION_FACTOR: 1.48902803168182,
	PRICE_FACTOR: 1.568803194,

	effects: {
		price: {
			building: {
				list: []
			},
			research: {
				list: []
			},
			unit: {
				list: []
			},
			list: []
		},
		military: {
			list: []
		},
		special: {
			list: []
		},
		income: {
			list: []
		},
	},

	Persons: {
		tamily: {
			name: 'Советник Тамили'
		},
		thirdenginery: {
			name: 'Третий Инженерный'
		},
		nataly: {
			name: 'Натали Верлен'
		},
		mechanic: {
			name: 'Механик'
		},
		calibrator: {
			name: 'Калибратор'
		}
	},

	getCurrentTime: function() {
		return Math.floor(new Date().valueOf() / 1000);
	},

	getObjectByType: function(type) {
		switch(type) {
			case 'building':
				return Game.Building;

			case 'unit':
				return Game.Unit;

			case 'mutual':
				return Game.Mutual;

			case 'research':
				return Game.Research;

			default:
				throw new Meteor.Error("Такого объекта нет");
		}
	}
}

Game.Effect = function(options) {
	this.constructor = function(options) {
		this.name = options.name;
		this.pretext = options.pretext;
		this.aftertext = options.aftertext;
		this.condition = options.condition;
		this.priority = options.priority;
		//this.type = options.type;
		this.affect = options.affect;
		this.result = options.result;

		Object.defineProperty(this, 'level', {
			get: function() {
				return this.provider.currentLevel();
			},
			enumerable: true
		});
	}

	this.constructor(options);

	this.next = function(level) {
		level = (level || this.level) + 1;

		return {
			name: this.name,
			pretext: this.pretext,
			aftertext: this.aftertext,
			condition: this.condition,
			priority: this.priority,
			affect: this.affect,
			
			level: level,
			result: this.result(level)
		};
	}

	this.register = function(obj) {
		//this.provider = obj;

		Object.defineProperty(this, 'provider', {
			value: obj,
			enumerable: false
		});

		if (this.condition && this.condition.type != 'all') {
			// Если влияет только на конкретный объект
			if (this.condition.name) {
				if (Game.effects[this.type][this.condition.name] == undefined) {
					Game.effects[this.type][this.condition.name] = {list: []};
				}

				Game.effects[this.type][this.condition.name].list.push(this);
			} else {
				if (Game.effects[this.type][this.condition.type] == undefined) {
					Game.effects[this.type][this.condition.type] = {list: []};
				}

				if (this.condition.group) {
					if (Game.effects[this.type][this.condition.type][this.condition.group] == undefined) {
						Game.effects[this.type][this.condition.type][this.condition.group] = {list: []};
					}

					if (this.condition.special) {
						if (Game.effects[this.type][this.condition.type][this.condition.group][this.condition.special] == undefined) {
							Game.effects[this.type][this.condition.type][this.condition.group][this.condition.special] = {list: []};
						}
						Game.effects[this.type][this.condition.type][this.condition.group][this.condition.special].list.push(this);
					} else {
						Game.effects[this.type][this.condition.type][this.condition.group].list.push(this);
					}
				} else {
					Game.effects[this.type][this.condition.type].list.push(this);
				}
			}
		} else {
			Game.effects[this.type].list.push(this);
		}
	}
}

Game.Effect.getRelatedTo = function(obj) {
	var effects = {};

	// По имени
	if (Game.effects[this.type][obj.engName]) {
		for (var i = 0; i < Game.effects[this.type][obj.engName].list.length; i++) {
			if (effects[Game.effects[this.type][obj.engName].list[i].priority] == undefined) {
				effects[Game.effects[this.type][obj.engName].list[i].priority] = [];
			}

			effects[Game.effects[this.type][obj.engName].list[i].priority].push(Game.effects[this.type][obj.engName].list[i])
		}
	}

	if (Game.effects[this.type][obj.type]) {
		// По типу
		if (Game.effects[this.type][obj.type].list) {
			for (var i = 0; i < Game.effects[this.type][obj.type].list.length; i++) {
				if (effects[Game.effects[this.type][obj.type].list[i].priority] == undefined) {
					effects[Game.effects[this.type][obj.type].list[i].priority] = [];
				}

				effects[Game.effects[this.type][obj.type].list[i].priority].push(Game.effects[this.type][obj.type].list[i])
			}
		}

		if (Game.effects[this.type][obj.type][obj.group]) {
			// По группе
			if (Game.effects[this.type][obj.type][obj.group].list) {
				for (var i = 0; i < Game.effects[this.type][obj.type][obj.group].list.length; i++) {
					if (effects[Game.effects[this.type][obj.type][obj.group].list[i].priority] == undefined) {
						effects[Game.effects[this.type][obj.type][obj.group].list[i].priority] = [];
					}

					effects[Game.effects[this.type][obj.type][obj.group].list[i].priority].push(Game.effects[this.type][obj.type][obj.group].list[i])
				}
			}

			// По особенности
			if (obj.special && Game.effects[this.type][obj.type][obj.group][obj.special] && Game.effects[this.type][obj.type][obj.group][obj.special].list) {
				for (var i = 0; i < Game.effects[this.type][obj.type][obj.group][obj.special].list.length; i++) {
					if (effects[Game.effects[this.type][obj.type][obj.group][obj.special].list[i].priority] == undefined) {
						effects[Game.effects[this.type][obj.type][obj.group][obj.special].list[i].priority] = [];
					}

					effects[Game.effects[this.type][obj.type][obj.group][obj.special].list[i].priority].push(Game.effects[this.type][obj.type][obj.group][obj.special].list[i])
				}
			}
		}
	}

	// Общий
	for (var i = 0; i < Game.effects[this.type].list.length; i++) {
		if (effects[Game.effects[this.type].list[i].priority] == undefined) {
			effects[Game.effects[this.type].list[i].priority] = [];
		}

		effects[Game.effects[this.type].list[i].priority].push(Game.effects[this.type].list[i])
	}

	var result = {};

	for (var priority in effects) {
		result[priority] = {};
		for (var i = 0; i < effects[priority].length; i++) {
			if (_.isArray(effects[priority][i].affect)) {
				var value = effects[priority][i].result();
				if (value && value != undefined) {
					for (var resource in effects[priority][i].affect) {
						if (result[priority][effects[priority][i].affect[resource]] == undefined) {
							result[priority][effects[priority][i].affect[resource]] = [];
						}

						result[priority][effects[priority][i].affect[resource]].push({
							value: value,
							provider: effects[priority][i].provider,
							type: effects[priority][i].type,
							priority: effects[priority][i].priority
						});
					}
				}
			} else {
				if (result[priority][effects[priority][i].affect] == undefined) {
					result[priority][effects[priority][i].affect] = [];
				}

				var value = effects[priority][i].result();
				if (value && value != undefined) {
					result[priority][effects[priority][i].affect].push({
						value: value,
						provider: effects[priority][i].provider,
						type: effects[priority][i].type,
						priority: effects[priority][i].priority
					});
				}
			}
		}
	}

	return result;
}

Game.Effect.getAll = function() {
	return this.getRelatedTo({});
}

Game.Effect.getValue = function(hideEffects) {
	hideEffects = hideEffects == undefined ? true : hideEffects;
	var effects = this.getAll();

	var result = {};

	Object.defineProperty(result, 'effects', {
		value: effects,
		configurable: true,
		enumerable: !hideEffects
	})

	for (var priority in effects) {
		for (var item in effects[priority]) {
			var effect = 0;
			for (var i = 0; i < effects[priority][item].length; i++) {
				effect += effects[priority][item][i].value;
			}

			if (result[item] == undefined) {
				result[item] = 0;
			}

			if (priority % 2 == 1) {
				result[item] += effect;
			} else {
				result[item] = result[item] + Math.floor(result[item] * (0.01 * effect));
			}
		}
	}

	return result;
}

// reduce - true = скидка, т.е. вычитаем эффекты
Game.Effect.applyTo = function(target, obj, hideEffects) {
	hideEffects = hideEffects == undefined ? true : hideEffects;
	var effects = this.getRelatedTo(target);

	Object.defineProperty(obj, 'effects', {
		value: effects,
		configurable: true,
		enumerable: !hideEffects
	})

	for (var priority in effects) {
		for (var item in effects[priority]) {
			var effect = 0;
			for (var i = 0; i < effects[priority][item].length; i++) {
				effect += effects[priority][item][i].value;
			}

			if (obj[item]) {
				if (priority % 2 == 1) {
					if (item == 'damage') { // TODO: Refactoring!
						obj[item].min += effect * (this.reduce ? -1 : 1);
						obj[item].max += effect * (this.reduce ? -1 : 1);
					} else {
						obj[item] += effect * (this.reduce ? -1 : 1);
					}
				} else {
					if (item == 'damage') { // TODO: Refactoring!
						obj[item].min = obj[item].min + Math.floor(obj[item].min * (0.01 * effect)) * (this.reduce ? -1 : 1);
						obj[item].max = obj[item].max + Math.floor(obj[item].max * (0.01 * effect)) * (this.reduce ? -1 : 1);
					} else {
						obj[item] = obj[item] + Math.floor(obj[item] * (0.01 * effect)) * (this.reduce ? -1 : 1);
					}
				}
			}
		}
	}

	return obj;
}

Game.Effect.Income = function(options) {
	Game.Effect.Income.superclass.constructor.apply(this, arguments);

	this.type = 'income';
	this.reduce = false;
}
extend(Game.Effect.Income, Game.Effect);
Game.Effect.Income.type = 'income';
Game.Effect.Income.reduce = false;

Game.Effect.Price = function(options) {
	Game.Effect.Price.superclass.constructor.apply(this, arguments);

	this.type = 'price';
	this.reduce = true;
}
extend(Game.Effect.Price, Game.Effect);
Game.Effect.Price.type = 'price';
Game.Effect.Price.reduce = true;


Game.Effect.Military = function(options) {
	Game.Effect.Military.superclass.constructor.apply(this, arguments);

	this.type = 'military';
	this.reduce = false;
}
extend(Game.Effect.Military, Game.Effect);
Game.Effect.Military.type = 'military';
Game.Effect.Military.reduce = false;


Game.Effect.Special = function(options) {
	Game.Effect.Special.superclass.constructor.apply(this, arguments);

	this.type = 'special';
	this.reduce = true;
}
extend(Game.Effect.Special, Game.Effect);
Game.Effect.Special.type = 'special';
Game.Effect.Special.reduce = true;


Game.Queue = {
	Collection: new Meteor.Collection('queue'),

	getAll: function() {
		return Game.Queue.Collection.find({user_id: Meteor.userId(), incomplete: true}).fetch();
	},

	getGroup: function(group) {
		return Game.Queue.Collection.findOne({user_id: Meteor.userId(), group: group, incomplete: true});
	},

	isBusy: function(group) {
		if (Meteor.userId()) {
			return Game.Queue.getGroup(group);	
		}
		return false;
	}
}