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

	'user.getPaymentHistory': function(isIncome) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		return Game.Payment.Collection.find({
			user_id: user._id,
			income: isIncome ? true : false
		}, {
			limit: 100
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
		rating: 100500
	}
}
*/

Game.PromoCode = {};

Game.PromoCode.types = {
	once: {},

	random: {
		items: [{
			resources: { credits: 10 }
		}, {
			resources: { crystals: 100 }
		}, {
			resources: { humans: 200 }
		}]
	}
}

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
		switch (promoCode.type) {
			case 'once': 
				var count = Game.PromoCode.Collection.find({
					type: 'once',
					user_id: user._id,
					activated: true
				}).count();

				if (count > 0) {
					throw new Meteor.Error('Вы не можете активировать этот промокод');
				}
				break;

			case 'random':
				var items = Game.PromoCode.types[promoCode.type].items;
				promoCode.profit = items[ Game.Random.interval(0, items.length - 1) ];
				break; 
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

			if (promoCode.profit.rating) {
				Meteor.users.update({
					_id: user._id
				}, {
					$inc: { rating: promoCode.profit.rating }
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