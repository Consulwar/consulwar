initPaymentServer = function() {

initPaymentLib();

Game.Payment.Collection = new Meteor.Collection('paymentHistory');

Game.Payment.log = function(isIncome, resources, source, uid) {
	var record = {
		user_id: uid ? uid : Meteor.userId(),
		resources: resources
	}

	if (isIncome) {
		record.income = true;
	}

	if (source) {
		record.source = source;
	}

	Game.Payment.Collection.insert(record);
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
	}
});

// ----------------------------------------------------------------------------
// Promo codes
// ----------------------------------------------------------------------------

Game.PromoCode = {
	Collection: new Meteor.Collection('promoCodes')
}

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

		// TODO: Check unique for user codes!

		if (promoCode.profit) {
			if (promoCode.profit.resources) {
				Game.Resources.add(promoCode.resources);
			}

			if (promoCode.profit.units) {
				Game.Unit.add(promoCode.units);
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
				activated: true
			}
		});
	}
});

}