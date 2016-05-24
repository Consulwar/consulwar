initPaymentServer = function() {

initPaymentLib();
initPaymentPlatboxServer();

Game.Payment.Collection._ensureIndex({
	user_id: 1
});

Game.Payment.Transactions = {
	Collection: new Meteor.Collection('paymentTransactions')
};

Game.Payment.Transactions.Collection._ensureIndex({
	user_id: 1
});

Game.Payment.log = function(isIncome, profit, source, uid) {
	var record = {
		user_id: uid ? uid : Meteor.userId(),
		profit: profit,
		timestamp: Game.getCurrentTime(),
		income: isIncome
	};

	if (source) {
		record.source = source;
	}

	Game.Payment.Collection.insert(record);

	// update user statistics
	Game.Statistic.incrementUser(record.user_id, {
		'payment.income': ( isIncome ? 1 : 0 ),
		'payment.expense': ( isIncome ? 0 : 1 )
	});
};

Game.Payment.logIncome = function(profit, source, uid) {
	Game.Payment.log(true, profit, source, uid);
};

Game.Payment.logExpense = function(profit, source, uid) {
	Game.Payment.log(false, profit, source, uid);
};

Meteor.methods({
	'user.getPaymentHistory': function(isIncome, page, count) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		if (count > 100) {
			throw new Meteor.Error('Много будешь знать - скоро состаришься');
		}

		return Game.Payment.Collection.find({
			user_id: user._id,
			income: isIncome ? true : false
		}, {
			sort: {
				timestamp: -1
			},
			skip: page > 1 ? (page - 1) * count : 0, 
			limit: count
		}).fetch();
	}
});

Meteor.publish('paymentHistory', function() {
	if (this.userId) {
		return Game.Payment.Collection.find({
			user_id: this.userId,
			income: true
		}, {
			limit: 1,
			sort: {
				timestamp: -1
			}
		});
	} else {
		this.ready();
	}
});

// ----------------------------------------------------------------------------
// Public methods only for development!
// ----------------------------------------------------------------------------

if (process.env.NODE_ENV == 'development') {
	Meteor.methods({
		'payment.testItem': function(id) {
			var item = Game.Payment.items[id];
			if (!item) {
				throw new Meteor.Error('Непральный id');
			}

			Game.Payment.logIncome(item.profit, {
				type: 'payment',
				item: item.id
			});
		}
	});
}

// ----------------------------------------------------------------------------
// Promo codes
// ----------------------------------------------------------------------------
/*
{
	code: 'pewpew11',
	maxActivations: 42, // not required
	                    // if not specified, then only 1 activation
	validthru: timestamp, // not required
	type: string, // not required
	              // random - get random item from Game.PromoCode.randomItems
	              // once:#type - give this type once per user (examples once:votePower, once:startBonus etc.)
	profit: {
		resources: {
			credits: 100,
			humans: 40,
			...
		},
		units: {
			fleet: {
				wasp: 10,
				...
			},
			ground: {
				fathers: 42,
				...
			},
			...
		},
		cards: {
			uncleBuilder: 1,
			...
		},
		houseItems: {
			tron: {
				gameofthrones: 1,
				...
			},
			...
		}
		votePower: 5
	}
}

Meteor.call('admin.addPromoCode', { code: 'testCard', profit: { cards: { uncleBuilder: 2 } } } )
Meteor.call('admin.addPromoCode', { code: 'testItem', profit: { houseItems: { tron: { gameofthrones: 1} } } } )

*/

Game.PromoCode = {
	Collection: new Meteor.Collection('promoCodes')
};

Game.PromoCode.Collection._ensureIndex({
	code: 1
});

Game.PromoCode.History = {
	Collection: new Meteor.Collection('promoCodesHistory')
};

Game.PromoCode.History.Collection._ensureIndex({
	user_id: 1
});

Game.PromoCode.randomItems =  [{
	resources: { metals: 50000, crystals: 15000 }
}, {
	resources: { credits: 100 }
}, {
	resources: { honor: 250 }
}, {
	units: { fleet: { wasp: 30 } }
}, {
	units: { fleet: { mirage: 15 } }
}, {
	units: { defense: { bomb: 150 } }
}, {
	units: { defense: { turret: 20 } }
}, {
	units: { ground: { horizontalbarman: 50 } }
}, {
	units: { ground: { agmogedcar: 5 } }
}, {
	units: { ground: { fast: 5 } }
}];

Meteor.methods({
	'admin.addPromoCode': function(options) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		if (['admin'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
		}

		// check reauired options
		check(options, Object);

		if (!options.code) {
			throw new Meteor.Error('Не задано поле code');
		}

		check(options.code, String);

		if (Game.PromoCode.Collection.findOne({
			code: options.code
		})) {
			throw new Meteor.Error('Такой код уже существует');
		}

		if (!options.profit) {
			throw new Meteor.Error('Не задано поле profit');
		}

		var isProfitOk = true;

		if (_.isObject(options.profit)) {
			if (
			    !options.profit.resources
			 && !options.profit.units
			 && !options.profit.votePower
			 && !options.profit.cards
			 && !options.profit.houseItems
			) {
				isProfitOk = false;
			}
		} else if (_.isString(options.profit)) {
			if (options.profit.indexOf('random') !== 0) {
				isProfitOk = false;
			}
		}

		if (!isProfitOk) {
			throw new Meteor.Error('Неправильно заполнено поле profit');
		}

		var promoCode = {
			code: options.code,
			profit: options.profit,
			activations: 0
		};

		// check not required options
		if (options.maxActivations) {
			check(options.maxActivations, Match.Integer);
			promoCode.maxActivations = options.maxActivations;
		} else {
			promoCode.maxActivations = 1;
		}

		if (options.validthru) {
			check(options.validthru, Match.Integer);
			promoCode.validthru = options.validthru;
		}

		if (options.type) {
			check(options.type, String);
			promoCode.type = options.type;
		}

		// insert code
		Game.PromoCode.Collection.insert(promoCode);
	},

	'user.activatePromoCode': function(code) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		check(code, String);

		var promoCode = Game.PromoCode.Collection.findOne({
			code: code
		});

		if (!promoCode) {
			throw new Meteor.Error('Такой код не существует');
		}

		if (promoCode.validthru && promoCode.validthru < Game.getCurrentTime()) {
			throw new Meteor.Error('Срок использования истек');
		}

		if (promoCode.usersActivated) {
			if (promoCode.usersActivated.indexOf(user._id) != -1) {
				throw new Meteor.Error('Вы уже активировали этот код');
			}

			if (
			    !promoCode.maxActivations
			 ||  promoCode.maxActivations <= promoCode.usersActivated.length
			) {
				throw new Meteor.Error('Такой код уже активирован другими игроками');
			}
		}

		var updateCount = Game.PromoCode.Collection.update({
			code: code,
			activations: { $lt: promoCode.maxActivations },
			usersActivated: { $ne: user._id }
		}, {
			$inc: { activations: 1 },
			$addToSet: { usersActivated: user._id }
		});

		if (updateCount === 0) {
			throw new Meteor.Error('Код уже активирован');
		}

		// check promo code type options
		if (promoCode.type) {
			if (promoCode.type.indexOf('once') === 0) {
				var count = Game.PromoCode.History.Collection.find({
					user_id: user._id,
					type: promoCode.type
				}).count();

				if (count > 0) {
					throw new Meteor.Error('Вы не можете активировать этот промокод');
				}
			}
		}

		// generate random profit
		var profit = promoCode.profit;

		if (_.isString(profit) && profit.indexOf('random') === 0) {
			var items = Game.PromoCode.randomItems;
			profit = items[ Game.Random.interval(0, items.length - 1) ];
		}

		// add profit
		if (profit) {
			Game.Resources.addProfit(profit);
			Game.Payment.logIncome(profit, {
				type: 'promo',
				code: promoCode.code
			});
		}

		// insert history record
		Game.PromoCode.History.Collection.insert({
			user_id: user._id,
			code: promoCode.code,
			codeId: promoCode._id,
			type: promoCode.type,
			profit: profit,
			timestamp: Game.getCurrentTime()
		});

		return profit;
	}
});

};