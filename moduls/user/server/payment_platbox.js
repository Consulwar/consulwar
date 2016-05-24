initPaymentPlatboxServer = function() {

if (!Meteor.settings.payment
 || !Meteor.settings.payment.platbox
 || !Meteor.settings.payment.platbox.url
 || !Meteor.settings.payment.platbox.secretKey
 || !Meteor.settings.payment.platbox.merchantId
 || !Meteor.settings.payment.platbox.project
) {
	throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры платежки (см. settings.sample payment.platbox)');
}

var BASE_URL = Meteor.settings.payment.platbox.url;
var SECRET_KEY = Meteor.settings.payment.platbox.secretKey;
var MERCHANT_ID = Meteor.settings.payment.platbox.merchantId;
var PROJECT = Meteor.settings.payment.platbox.project;

Router.route('/paymentGateway', function () {
	console.log('-------- Got payment request --------');

	this.response.statusCode = 200;
	this.response.setHeader('Content-Type', 'application/json; charset=utf-8');

	var data = this.request.body;
	var responseData = null;

	// parse body to json
	if (!_.isObject(data)) {
		console.log('Error: body was not JSON');
		console.log('request body:', this.request.body);
		console.log('-------------------------------------');
		responseData = {
			'status': 'error',
			'code': 400,
			'description': 'Неверный формат сообщения'
		};
		this.response.setHeader('X-Signature', signString( JSON.stringify(responseData) ));
		this.response.end( JSON.stringify(responseData) );
		return;
	}

	// check signature
	if (this.request.headers['x-signature'] != signString( JSON.stringify(this.request.body) ).toUpperCase()) {
		console.log('Error: incorrect signature!');
		console.log('x-signature:', this.request.headers['x-signature']);
		console.log('signed string:', signString( JSON.stringify(this.request.body) ).toUpperCase());
		console.log('request body:', this.request.body);
		console.log('-------------------------------------');
		responseData = {
			'status': 'error',
			'code': 401,
			'description': 'Некорректная подпись запроса'
		};
		this.response.setHeader('X-Signature', signString( JSON.stringify(responseData) ));
		this.response.end( JSON.stringify(responseData) );
		return;
	}

	// check data format
	var dataErrors = [];

	if (!data) {
		dataErrors.push('data is null');
	} else {
		// check action
		if (!data.action) {
			dataErrors.push('data.action required');
		} else {
			if (['check', 'pay', 'cancel'].indexOf(data.action) == -1) {
				dataErrors.push('data.action must be check, pay or cancel');
			} else if (data.action != 'check' && !data.merchant_tx_id) {
				dataErrors.push('data.merchant_tx_id required');
			}
		}
		// check payment info
		if (!data.payment
		 || !data.payment.amount
		 || !data.payment.currency
		 || !data.payment.exponent
		) {
			dataErrors.push('data.payment.amount required');
			dataErrors.push('data.payment.currency required');
			dataErrors.push('data.payment.exponent required');
		}
		// check account info
		if (!data.account || !data.account.id) {
			dataErrors.push('data.account.id required');
		}
		// check order items info
		if (!data.order || !data.order.item_list) {
			dataErrors.push('data.order.item_list required');
		} else {
			if (!_.isArray(data.order.item_list)
			 ||  data.order.item_list.length === 0
			 || !data.order.item_list[0].id
			 || !data.order.item_list[0].profit
			) {
				dataErrors.push('data.order.item_list is incorrect');
			}
		}
	}

	if (dataErrors.length > 0) {
		console.log('Error: incorrect request data!');
		console.log('data:', data);
		console.log(dataErrors.join('\n'));
		console.log('-------------------------------------');
		responseData = {
			'status': 'error',
			'code': 406,
			'description': 'Неверные данные запроса'
		};
		this.response.setHeader('X-Signature', signString( JSON.stringify(responseData) ));
		this.response.end( JSON.stringify(responseData) );
		return;
	}

	// check user account
	var user = Meteor.users.findOne({
		_id: data.account.id
	});

	console.log('User id:', data.account.id);
	if (user) {
		console.log('User name:', user.username);
	}

	if (!user || !user._id || user.blocked === true) {
		console.log('Error: user not found or blocked!');
		console.log('-------------------------------------');
		responseData = {
			'status': 'error',
			'code': 1001,
			'description': 'Учётная запись пользователя не найдена или заблокирована'
		};
		this.response.setHeader('X-Signature', signString( JSON.stringify(responseData) ));
		this.response.end( JSON.stringify(responseData) );
		return;
	}

	// check payment item
	var paymentItem = Game.Payment.items[ data.order.item_list[0].id ];

	if (!paymentItem
	 || !paymentItem.profit
	 || !_.isEqual(paymentItem.profit, data.order.item_list[0].profit)
	) {
		console.log('Error: incorrect payment item!');
		console.log('payment item:', data.order.item_list[0]);
		console.log('-------------------------------------');
		responseData = {
			'status': 'error',
			'code': 1005,
			'description': 'Запрашиваемые товары или услуги недоступны'
		};
		this.response.setHeader('X-Signature', signString( JSON.stringify(responseData) ));
		this.response.end( JSON.stringify(responseData) );
		return;
	}

	if (data.payment.currency != 'RUB') {
		console.log('Error: incorrect currency!');
		console.log('payment info:', data.payment);
		console.log('-------------------------------------');
		responseData = {
			'status': 'error',
			'code': 1002,
			'description': 'Неверная валюта платежа'
		};
		this.response.setHeader('X-Signature', signString( JSON.stringify(responseData) ));
		this.response.end( JSON.stringify(responseData) );
		return;
	}

	if (data.payment.exponent != 2
	 || data.payment.amount != (paymentItem.cost.rub * 100).toString()
	) {
		console.log('Error: incorrect payment amount');
		console.log('payment info:', data.payment);
		console.log('item cost:', paymentItem.cost);
		console.log('-------------------------------------');
		responseData = {
			'status': 'error',
			'code': 1003,
			'description': 'Неверная сумма платежа'
		};
		this.response.setHeader('X-Signature', signString( JSON.stringify(responseData) ));
		this.response.end( JSON.stringify(responseData) );
		return;
	}

	// check transaction
	if (data.action == 'check') {
		// try to insert transaction
		var checkResult = Game.Payment.Transactions.Collection.upsert({
			user_id: user._id,
			transaction_id: data.platbox_tx_id,
			payment_system: 'platbox'
		}, {
			$setOnInsert: {
				user_id: user._id,
				transaction_id: data.platbox_tx_id,
				payment_system: 'platbox',
				status: 'check',
				time_created: Game.getCurrentTime()
			}
		});
		
		if (checkResult.insertedId) {
			// transaction inserted
			console.log('Transaction created');
			console.log('platbox transaction id:', data.platbox_tx_id);
			console.log('merchant transaction id:', checkResult.insertedId);
			console.log('-------------------------------------');
			responseData = {
				'status': 'ok',
				'merchant_tx_id': checkResult.insertedId
			};
			this.response.setHeader('X-Signature', signString( JSON.stringify(responseData) ));
			this.response.end( JSON.stringify(responseData) );
			return;
		}
	}

	// cancel transaction
	else if (data.action == 'cancel') {
		// try to cancel transaction
		var cancelResult = Game.Payment.Transactions.Collection.update({
			_id: data.merchant_tx_id,
			user_id: user._id,
			transaction_id: data.platbox_tx_id,
			payment_system: 'platbox',
			status: 'check'
		}, {
			$set: {
				status: 'cancel',
				time_updated: Game.getCurrentTime()
			}
		});

		if (cancelResult == 1) {
			// transaction canceled
			console.log('Transaction canceled');
			console.log('platbox transaction id:', data.platbox_tx_id);
			console.log('merchant transaction id:', data.merchant_tx_id);
			console.log('-------------------------------------');
			responseData = {
				'status': 'ok',
				'merchant_tx_timestamp': new Date().toISOString()
			};
			this.response.setHeader('X-Signature', signString( JSON.stringify(responseData) ));
			this.response.end( JSON.stringify(responseData) );
			return;
		}
	}

	// finish transaction
	else if (data.action == 'pay') {
		// try to finish transaction
		var payResult = Game.Payment.Transactions.Collection.update({
			_id: data.merchant_tx_id,
			user_id: user._id,
			transaction_id: data.platbox_tx_id,
			payment_system: 'platbox',
			status: 'check'
		}, {
			$set: {
				status: 'pay',
				time_updated: Game.getCurrentTime()
			}
		});

		if (payResult == 1) {
			// add profit
			console.log('Got profit');
			Game.Resources.addProfit(data.order.item_list[0].profit, data.account.id);
			Game.Payment.logIncome(data.order.item_list[0].profit, {
				type: 'payment',
				item: paymentItem.id,
				transaction_id: data.platbox_tx_id,
				payment_system: 'platbox'
			}, data.account.id);

			// send response
			console.log('Transaction finished');
			console.log('platbox transaction id:', data.platbox_tx_id);
			console.log('merchant transaction id:', data.merchant_tx_id);
			console.log('-------------------------------------');
			responseData = {
				'status': 'ok',
				'merchant_tx_timestamp': new Date().toISOString()
			};
			this.response.setHeader('X-Signature', signString( JSON.stringify(responseData) ));
			this.response.end( JSON.stringify(responseData) );
			return;
		}
	}

	// handle transaction error
	var errorCode = 1000;
	var errorMessge = 'Неизвестная ошибка';

	var transaction = Game.Payment.Transactions.Collection.findOne({
		user_id: user._id,
		transaction_id: data.platbox_tx_id,
		payment_system: 'platbox'
	});

	if (transaction) {
		switch (transaction.status) {
			case 'check':
				errorCode = 2000;
				errorMessge = 'Платёж с указанным идентификатором уже зарезервирован';
				break;
			case 'pay':
				errorCode = 2001;
				errorMessge = 'Платёж с указанным идентификатором уже проведен';
				break;
			case 'cancel':
				errorCode = 2002;
				errorMessge = 'Платёж с указанным идентификатором уже отменён';
				break;
		}
	}

	console.log('Error: transaction error ', errorCode);
	console.log('platbox transaction id:', data.platbox_tx_id);
	console.log('merchant transaction id:', data.merchant_tx_id);
	console.log('-------------------------------------');
	responseData = {
		'status': 'error',
		'code': errorCode,
		'description': errorMessge
	};
	this.response.setHeader('X-Signature', signString( JSON.stringify(responseData) ));
	this.response.end( JSON.stringify(responseData) );

}, {where: 'server'});

var objectRecursiveSort = function(obj) {
	return _.object( _.sortBy( _.map(obj, function(value, key) {
		return [
			key,
			value
		];
	}), function(arr) {
		return arr[0];
	}));
};

var signObject = function(data) {
	var sortedData = objectRecursiveSort(data);
	var forSign = {};

	for (var key in sortedData) {
		if (typeof sortedData[key] === 'string') {
			forSign[key] = sortedData[key];
		} else {
			forSign[key] = JSON.stringify(sortedData[key]);
		}
	}

	return signString(JSON.stringify(forSign));
};

var signString = function(str) {
	return (
		CryptoJS.HmacSHA256(
			str, 
			SECRET_KEY
		).toString()
	);
};

Meteor.methods({
	'platbox.getPaymentUrl': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		// check payment item
		check(id, String);
		var paymentItem = Game.Payment.items[id];

		if (!paymentItem || !paymentItem.profit) {
			throw new Meteor.Error('Ты втираешь мне какую-то дичь');
		}

		// create url
		var pay = {
			account: {
				id: user._id
			},
			amount: (paymentItem.cost.rub * 100).toString(),
			currency: 'RUB',
			merchant_id: MERCHANT_ID,
			order: {
				type: 'item_list',
				item_list: [{
					id: id,
					profit: paymentItem.profit
				}]
			},
			project: PROJECT
		};

		pay.sign = signObject(pay);

		var url = '';
		for (var key in pay) {
			url += key + '=';
			if (typeof pay[key] === 'string') {
				url += pay[key];
			} else {
				url += JSON.stringify(pay[key]);
			}
			url += '&';
		}

		return BASE_URL + '?' + url.substr(0, url.length - 1);
	}
});
	
};