initPaymentLib = function() {
'use strict';

game.PaymentItem = function(options) {
	this.id = options.id;
	this.name = options.name;
	this.description = options.description;
	this.profit = options.profit;
	this.cost = options.cost;
	this.discount = options.discount;
	this.result = options.result;

	Game.Payment.items[options.id] = this;
};

Game.Payment = {
	items: {}
};

Game.Payment.Income = {
	// This collection is required on client side for notification window!
	Collection: new Meteor.Collection('paymentIncome')
};

new game.PaymentItem({
	id: 'paymentCredits1000',
	name: '1000 ГГК',
	description: 'Война – дело дорогое, но главное начать',
	profit: {
		resources: { credits: 1000 }
	},
	result: {
		base: 1000
	},
	cost: { rub: 100 }
});

new game.PaymentItem({
	id: 'paymentCredits2500',
	name: '2500 ГГК',
	description: 'Неплохой стартовый капитал',
	profit: {
		resources: { credits: 2500 }
	},
	result: {
		base: 2300,
		bonus: 200
	},
	cost: { rub: 230 },
	discount: { rub: 20 }
});

new game.PaymentItem({
	id: 'paymentCredits5000',
	name: '5000 ГГК',
	description: 'На это можно построить флот',
	profit: {
		resources: { credits: 5000 }
	},
	result: {
		base: 4500,
		bonus: 500
	},
	cost: { rub: 450 },
	discount: { rub: 50 }
});

new game.PaymentItem({
	id: 'paymentCredits10000',
	name: '10000 ГГК',
	description: 'Силу в тебе я ощущаю',
	profit: {
		resources: { credits: 10000 }
	},
	result: {
		base: 8500,
		bonus: 1500
	},
	cost: { rub: 850 },
	discount: { rub: 150 }
});

new game.PaymentItem({
	id: 'paymentCredits25000',
	name: '25000 ГГК',
	description: 'Слышу трепет Рептилоидных задниц',
	profit: {
		resources: { credits: 25000 }
	},
	result: {
		base: 20000,
		bonus: 5000
	},
	cost: { rub: 2000 },
	discount: { rub: 500 }
});

new game.PaymentItem({
	id: 'paymentCredits50000',
	name: '50000 ГГК',
	description: 'Теперь Рептилоиды точно ахуеют',
	profit: {
		resources: { credits: 50000 }
	},
	result: {
		base: 37500,
		bonus: 12500
	},
	cost: { rub: 3750 },
	discount: { rub: 1250 }
});


new game.PaymentItem({
	id: 'music',
	name: 'Музыкальный альбом',
	description: 'Клёвая музычка',
	profit: {
		music: true
	},
	cost: { rub: 200 },
	discount: { rub: 50 }
});

Game.Helpers.deepFreeze(Game.Payment.items);
};