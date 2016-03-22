initPaymentServer = function() {

initPaymentLib();

Game.Payment.Collection = new Meteor.Collection('paymentHistory');

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
	Game.Statistic.Collection.update({
		user_id: uid ? uid : Meteor.userId()
	}, {
		$inc: ( isIncome ? { incomeHistoryCount: 1 } : { expenseHistoryCount: 1 } )
	});
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

Game.PromoCode = {};

Game.PromoCode.randomItems =  [{
	resources: { credits: 10 }
}, {
	resources: { crystals: 100 }
}, {
	resources: { humans: 200 }
}];

Game.PromoCode.Collection = new Meteor.Collection('promoCodes');

Meteor.methods({
	'user.activatePromoCode': function(code) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(code, String);

		var promoCode = Game.PromoCode.Collection.findOne({
			code: code
		});

		if (!promoCode) {
			throw new Meteor.Error('Такой код не существует');
		}

		if (promoCode.activated) {
			throw new Meteor.Error('Такой код уже активирован');
		}

		if (promoCode.validthru && promoCode.validthru < Game.getCurrentTime()) {
			throw new Meteor.Error('Срок использования истек');
		}

		// check promo code type options
		if (promoCode.type) {
			if (promoCode.type.indexOf('once') == 0) {
				var count = Game.PromoCode.Collection.find({
					type: promoCode.type,
					user_id: user._id,
					activated: true
				}).count();

				if (count > 0) {
					throw new Meteor.Error('Вы не можете активировать этот промокод');
				}
			}
		}

		// generate random profit
		if (_.isString(promoCode.profit) && promoCode.profit.indexOf('random') == 0) {
			var items = Game.PromoCode.randomItems;
			promoCode.profit = items[ Game.Random.interval(0, items.length - 1) ];
		}

		// add profit
		if (promoCode.profit) {
			if (promoCode.profit.resources) {
				Game.Resources.add(promoCode.resources);
			}

			if (promoCode.profit.units) {
				var units = promoCode.profit.units;
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

			if (promoCode.profit.votePower) {
				Meteor.users.update({
					_id: user._id
				}, {
					$inc: { votePowerBonus: promoCode.profit.votePower }
				});
			}
		}

		Game.PromoCode.Collection.update({
			code: code
		}, {
			$set: {
				user_id: user._id,
				activated: true,
				profit: promoCode.profit
			}
		});
	}
});

}