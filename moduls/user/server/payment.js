initPaymentServer = function() {

initPaymentLib();

Game.Payment.Collection = new Meteor.Collection('paymentHistory');

Game.Payment.Collection._ensureIndex({
	user_id: 1
});

Game.Payment.log = function(isIncome, resources, source, uid) {
	var record = {
		user_id: uid ? uid : Meteor.userId(),
		resources: resources,
		timestamp: Game.getCurrentTime()
	}

	if (isIncome) {
		record.income = true;
	}

	if (source) {
		record.source = source;
	}

	Game.Payment.Collection.insert(record);

	// update user statistics
	var increment = isIncome
		? { incomeHistoryCount: 1 }
		: { expenseHistoryCount: 1 };

	Game.Statistic.incrementUser(record.user_id, increment);
}

Game.Payment.logIncome = function(resources, source, uid) {
	Game.Payment.log(true, resources, source, uid);
}

Game.Payment.logExpense = function(resources, source, uid) {
	Game.Payment.log(false, resources, source, uid);
}

Meteor.methods({
	'user.buyPaymentItem': function(id) {

		// TODO: Подключить систему приема платежей!

		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(id, String);
		var paymentItem = Game.Payment.items[id];

		if (!paymentItem) {
			throw new Meteor.Error('Ты втираешь мне какую-то дичь');
		}

		// Этот код только для внутреннего теста
		// TODO: Убрать когда подключим платежку
		var history = Game.Payment.Collection.find({
			user_id: user._id,
			income: { $ne: false }
		}).fetch();

		var totalCredits = paymentItem.resources.credits;

		for (var i = 0; i < history.length; i++) {
			if (history[i].resources && history[i].resources.credits) {
				totalCredits += history[i].resources.credits;
			}
		}

		if (totalCredits >= 5000) {
			throw new Meteor.Error('Больше получить кредитов нельзя, пока идет внутренний тест');
		}

		// Ниже идет код для зачисления ресурсов при удачном платеже
		// TODO: Перенести в callback
		Game.Resources.add(paymentItem.resources);
		Game.Payment.logIncome(paymentItem.resources, id);
	},

	'user.getPaymentHistory': function(isIncome, page, count) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
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

// ----------------------------------------------------------------------------
// Promo codes
// ----------------------------------------------------------------------------
/*
{
	code: 'pewpew11',
	maxActivations: 42, // not required
	validthru: timestamp, // not required
	type: string, // not required
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
		votePower: 5
	}
}
*/

Game.PromoCode = {
	Collection: new Meteor.Collection('promoCodes')
}

Game.PromoCode.Collection._ensureIndex({
	code: 1
});

Game.PromoCode.History = {
	Collection: new Meteor.Collection('promoCodesHistory')
}

Game.PromoCode.History.Collection._ensureIndex({
	user_id: 1
});

Game.PromoCode.randomItems =  [{
	resources: { credits: 10 }
}, {
	resources: { crystals: 100 }
}, {
	resources: { humans: 200 }
}];

Meteor.methods({
	'admin.addPromoCode': function(options) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
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
			) {
				isProfitOk = false;
			}
		} else if (_.isString(options.profit)) {
			if (options.profit.indexOf('random') != 0) {
				isProfitOk = false;
			}
		}

		if (!isProfitOk) {
			throw new Meteor.Error('Неправильно заполнено поле profit');
		}

		var promoCode = {
			code: options.code,
			profit: options.profit
		}

		// check not required options
		if (options.maxActivations) {
			check(options.maxActivations, Match.Integer);
			promoCode.maxActivations = options.maxActivations;
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

		if (user.blocked == true) {
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

		// check promo code type options
		if (promoCode.type) {
			if (promoCode.type.indexOf('once') == 0) {
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

		if (_.isString(profit) && profit.indexOf('random') == 0) {
			var items = Game.PromoCode.randomItems;
			profit = items[ Game.Random.interval(0, items.length - 1) ];
		}

		// add profit
		if (profit) {
			if (profit.resources) {
				Game.Resources.add(profit.resources);
			}

			if (profit.units) {
				var units = profit.units;
				for (var group in units) {
					for (var name in units[group]) {
						Game.Unit.add({
							engName: name,
							group: group,
							count: parseInt( units[group][name], 10 )
						});
					}
				}
			}

			if (profit.votePower) {
				Meteor.users.update({
					_id: user._id
				}, {
					$inc: { votePowerBonus: profit.votePower }
				});
			}
		}

		// update promo code
		Game.PromoCode.Collection.update({
			code: code
		}, {
			$addToSet: {
				usersActivated: user._id
			}
		});

		// insert history record
		Game.PromoCode.History.Collection.insert({
			user_id: user._id,
			code: promoCode.code,
			codeId: promoCode._id,
			type: promoCode.type,
			profit: profit,
			timestamp: Game.getCurrentTime()
		});
	}
});

}