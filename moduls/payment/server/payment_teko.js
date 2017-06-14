const PAYMENT_SYSTEM = 'teko';

const errorCodes = {
	400: 'Неверный формат сообщения',
	401: 'Некорректная подпись запроса',
	406: 'Неверные данные запроса',
	1000: 'Неизвестная ошибка',
	1001: 'Учётная запись пользователя не найдена или заблокирована',
	1002: 'Неверная валюта платежа',
	1003: 'Неверная сумма платежа',
	1005: 'Запрашиваемые товары или услуги недоступны',
	2000: 'Платёж с указанным идентификатором уже зарезервирован',
	2001: 'Платёж с указанным идентификатором уже проведён',
	2002: 'Платёж с указанным идентификатором уже отменён'
};

initPaymentTekoServer = function() {
'use strict';

Game.Payment.Teko = {};

initConfigTekoServer();

Router.route('/api/payment/teko/check', function () {
	checkRequest(this.request, this.response, function({user, data, response}) {
		// try to insert transaction
		let checkResult = Game.Payment.Transactions.Collection.upsert({
			user_id: user._id,
			transaction_id: data.tx.id,
			payment_system: PAYMENT_SYSTEM
		}, {
			$setOnInsert: {
				user_id: user._id,
				username: user.username,
				transaction_id: data.tx.id,
				payment_system: PAYMENT_SYSTEM,
				status: 'check',
				time_created: Game.getCurrentTime()
			}
		});

		if (checkResult.insertedId) {
			// transaction inserted
			console.log('Transaction created');
			console.log('teko transaction id:', data.tx.id);
			console.log('merchant transaction id:', checkResult.insertedId);
			console.log('-------------------------------------');
			answerSuccess(response, checkResult.insertedId);
			return true;
		}
		return false;
	});
}, {where: 'server'});

Router.route('/api/payment/teko/success', function () {
	checkRequest(this.request, this.response, function({user, data, paymentItem, response}) {
		let payResult = Game.Payment.Transactions.Collection.update({
			_id: data.partner_tx.id,
			user_id: user._id,
			transaction_id: data.tx.id,
			payment_system: PAYMENT_SYSTEM,
			status: 'check'
		}, {
			$set: {
				status: 'pay',
				time_updated: Game.getCurrentTime(),
				amount: paymentItem.cost.rub
			}
		});

		if (payResult === 1) {
			// add profit
			if (data.order.extra.profit.resources !== undefined) {
				Game.Resources.addProfit(data.order.extra.profit, data.dst.id);
			} else {
				// Обработка музыки
				if (data.order.extra.profit.music) {
					Meteor.users.update({
						_id: data.dst.id
					}, {
						$set: {
							music: true
						}
					});
				}
			}

			Game.Payment.Income.log(data.order.extra.profit, {
				type: 'payment',
				item: paymentItem.id,
				transaction_id: data.tx.id,
				payment_system: PAYMENT_SYSTEM
			}, data.dst.id);

			Game.datadog.increment('payment_teko', paymentItem.cost.rub);

			// send response
			console.log('Transaction finished');
			console.log('teko transaction id:', data.tx.id);
			console.log('merchant transaction id:', data.partner_tx.id);
			console.log('-------------------------------------');
			answerSuccess(response, data.partner_tx.id);
			return true;
		}

		return false;
	});
}, {where: 'server'});

Router.route('/api/payment/teko/cancel', function () {
	checkRequest(this.request, this.response, function({user, data, response}) {
		let cancelResult = Game.Payment.Transactions.Collection.update({
			_id: data.partner_tx.id,
			user_id: user._id,
			transaction_id: data.tx.id,
			payment_system: PAYMENT_SYSTEM,
			status: 'check'
		}, {
			$set: {
				status: 'cancel',
				time_updated: Game.getCurrentTime(),
				reason: {
					code: data.code,
					description: data.description
				}
			}
		});

		if (cancelResult === 1) {
			// transaction canceled
			console.log('Transaction canceled');
			console.log('teko transaction id:', data.tx.id);
			console.log('merchant transaction id:', data.partner_tx.id);
			console.log('-------------------------------------');

			answerSuccess(response, data.partner_tx.id);
			return true;
		}
		return false;
	});
}, {where: 'server'});

let checkRequest = function(request, response, onOk) {
	let data = request.body;

	//check body
	if (!_.isObject(data)) {
		answerError(response, data, 400);
		return;
	}

	// check signature
	if (request.headers.signature !== signString(request.rawBody)) {
		answerError(response, data, 401);
		return;
	}

	if (!checkDataFormat(data)) {
		answerError(response, data, 406);
		return;
	}

	let user = Meteor.users.findOne({
		_id: data.dst.id
	});

	if (!user || !user._id || user.blocked === true) {
		answerError(response, data, 1001);
		return;
	}

	if (data.payment.currency !== 643) {
		answerError(response, data, 1002);
		return;
	}

	let paymentItem = Game.Payment.items[ data.order.item_list[0].id ];

	if (data.payment.exponent !== 2 || data.payment.amount !== paymentItem.cost.rub * 100) {
		answerError(response, data, 1003);
		return;
	}

	if ( !paymentItem
		|| !paymentItem.profit
		|| !_.isEqual(paymentItem.profit, data.order.extra.profit)
	) {
		answerError(response, data, 1005);
		return;
	}

	if (!onOk({user, data, paymentItem, response})) {
		handleTransactionError(user, data, response);
	}
};

let answerError = function(response, data, code) {
	let description = errorCodes[code];
	let responseData = {
		success: false,
		result: {
			tx: {
				id: data.partner_tx.id,
				start_t: Date.now()
			},
			code: code,
			description: description
		}
	};
	response.end(JSON.stringify(responseData));
};

let answerSuccess = function(response, id) {
	let responseData = {
		success: true,
		result: {
			tx: {
				id: id,
				start_t: Date.now()
			}
		}
	};
	response.end(JSON.stringify(responseData));
};

let checkDataFormat = function(data) {
	let dataErrors = [];

	if (!data) {
		dataErrors.push('data is null');
	} else {
		// check payment info
		if ( !data.payment
			|| !data.payment.amount
			|| !data.payment.currency
			|| !data.payment.exponent
		) {
			dataErrors.push('data.payment.amount required');
			dataErrors.push('data.payment.currency required');
			dataErrors.push('data.payment.exponent required');
		}
		// check dst info
		if (!data.dst || !data.dst.id) {
			dataErrors.push('data.dst.id required');
		}
		// check order items info
		if (!data.order || !data.order.item_list) {
			dataErrors.push('data.order.item_list required');
		} else {
			if (!_.isArray(data.order.item_list)
				||  data.order.item_list.length === 0
				|| !data.order.item_list[0].id
				|| !data.order.item_list[0].name
			) {
				dataErrors.push('data.order.item_list is incorrect');
			}

			if (!_.isObject(data.order.extra.profit)) {
				dataErrors.push('data.order.extra is incorrect');
			}
		}
	}

	if (dataErrors.length > 0) {
		console.log('Error: incorrect request data!');
		console.log('data:', data);
		console.log(dataErrors.join('\n'));
		console.log('-------------------------------------');

		return false;
	}

	return true;
};

let handleTransactionError = function(user, data, response) {
	let errorCode = 1000;

	let transaction = Game.Payment.Transactions.Collection.findOne({
		user_id: user._id,
		transaction_id: data.tx.id,
		payment_system: PAYMENT_SYSTEM
	});

	if (transaction) {
		switch (transaction.status) {
			case 'check':
				errorCode = 2000;
				break;
			case 'pay':
				errorCode = 2001;
				break;
			case 'cancel':
				errorCode = 2002;
				break;
		}
	}

	answerError(response, data, errorCode);
};

Meteor.methods({
	'teko.getPaymentUrl': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		Game.Log.method('teko.getPaymentUrl');

		// check payment item
		check(id, String);
		let paymentItem = Game.Payment.items[id];

		if (!paymentItem || !paymentItem.profit) {
			throw new Meteor.Error('Ты втираешь мне какую-то дичь');
		}

		// create url
		let pay = {
			initiator: {
				id: Game.Payment.Teko.INITIATOR_ID,
				showcase: Game.Payment.Teko.SHOWCASE
			},
			payment: {
				amount: paymentItem.cost.rub * 100,
				currency: 643, //RUB
				exponent: 2
			},
			order: {
				cls: 'item_list',
				item_list: [{
					id: id,
					name: paymentItem.name
				}],
				extra: {
					profit: paymentItem.profit
				}
			},
			dst: {
				id: user._id
			},
			locale: Game.Payment.Teko.LOCALE,
			product: Game.Payment.Teko.PRODUCT,
			theme: 'light',
			url: 'https://consulwar.ru/'
		};

		pay.signature = signObject(pay);

		let url = '';
		for (let key in pay) {
			if (pay.hasOwnProperty(key)) {
				url += key + '=';
				if (typeof pay[key] === 'string') {
					url += encodeURIComponent( pay[key] );
				} else {
					url += encodeURIComponent( JSON.stringify(pay[key]) );
				}
				url += '&';
			}
		}

		return Game.Payment.Teko.BASE_URL + '?' + url.substr(0, url.length - 1);
	}
});

let signObject = function(data) {
	let sortedData = objectRecursiveSort(data);
	let forSign = [];

	for (let key in sortedData) {
		if (sortedData.hasOwnProperty(key) && signedKey(key)) {
			let value = sortedData[key];
			if (typeof value === 'string') {
				forSign.push(key, value);
			} else {
				forSign.push(key, JSON.stringify(value));
			}
		}
	}

	return signString(forSign.join('|'));
};

let signedKey = function(key) {
	return ['initiator', 'dst', 'payment', 'order', 'product', 'redirect_url', 'locale', 'comment',
		'inner_cur_amount', 'inner_cur_name'].indexOf(key) >= 0;
};

let objectRecursiveSort = function(obj) {
	return _.object( _.sortBy( _.map(obj, function(value, key) {
		return [
			key,
			value
		];
	}), function(arr) {
		return arr[0];
	}));
};

let signString = function(str) {
	return (
		CryptoJS.HmacSHA1(
			str,
			Game.Payment.Teko.SECRET_KEY
		).toString(CryptoJS.enc.Base64)
	);
};

};