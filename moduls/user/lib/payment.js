initPaymentLib = function() {

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
	description: 'Война дело дорогое, но главное начать',
	profit: {
		resources: { credits: 1150 }
	},
	result: {
		base: 1000,
		extra: 150
	},
	cost: { rub: 100 }
});

new game.PaymentItem({
	id: 'paymentCredits2500',
	name: '2500 ГГК',
	description: 'Неплохой стартовый капитал',
	profit: {
		resources: { credits: 2875 }
	},
	result: {
		base: 2300,
		bonus: 200,
		extra: 375
	},
	cost: { rub: 230 },
	discount: { rub: 20 }
});

new game.PaymentItem({
	id: 'paymentCredits5000',
	name: '5000 ГГК',
	description: 'На это можно построить флот',
	profit: {
		resources: { credits: 5750 }
	},
	result: {
		base: 4500,
		bonus: 500,
		extra: 750
	},
	cost: { rub: 450 },
	discount: { rub: 50 }
});

new game.PaymentItem({
	id: 'paymentCredits10000',
	name: '10000 ГГК',
	description: 'Силу в тебе я ощущаю',
	profit: {
		resources: { credits: 11500 }
	},
	result: {
		base: 8500,
		bonus: 1500,
		extra: 1500
	},
	cost: { rub: 850 },
	discount: { rub: 150 }
});

new game.PaymentItem({
	id: 'paymentCredits25000',
	name: '25000 ГГК',
	description: 'Слышу трепет Рептилоидных задниц',
	profit: {
		resources: { credits: 28750 }
	},
	result: {
		base: 20000,
		bonus: 5000,
		extra: 3750
	},
	cost: { rub: 2000 },
	discount: { rub: 500 }
});

new game.PaymentItem({
	id: 'paymentCredits50000',
	name: '50000 ГГК',
	description: 'Теперь Рептилоиды точно ахуеют',
	profit: {
		resources: { credits: 57500 }
	},
	result: {
		base: 37500,
		bonus: 12500,
		extra: 7500
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
	cost: { rub: 150 },
	discount: { rub: 100 }
});

};