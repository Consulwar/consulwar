initPaymentLib = function() {

game.PaymentItem = function(options) {
	this.id = options.id;
	this.name = options.name;
	this.profit = options.profit;
	this.cost = options.cost;
	this.discount = options.discount;

	Game.Payment.items[options.id] = this;
}

Game.Payment = {
	items: {}
}

new game.PaymentItem({
	id: 'paymentCredits1000',
	name: '1000 ГГК',
	profit: {
		resources: { credits: 1000 }
	},
	cost: { rub: 100 }
});

new game.PaymentItem({
	id: 'paymentCredits2500',
	name: '2500 ГГК',
	profit: {
		resources: { credits: 2500 }
	},
	cost: { rub: 230 },
	discount: { rub: 20 }
});

new game.PaymentItem({
	id: 'paymentCredits5000',
	name: '5000 ГГК',
	profit: {
		resources: { credits: 5000 }
	},
	cost: { rub: 450 },
	discount: { rub: 50 }
});

new game.PaymentItem({
	id: 'paymentCredits10000',
	name: '10000 ГГК',
	profit: {
		resources: { credits: 10000 }
	},
	cost: { rub: 850 },
	discount: { rub: 150 }
});

new game.PaymentItem({
	id: 'paymentCredits25000',
	name: '25000 ГГК',
	profit: {
		resources: { credits: 25000 }
	},
	cost: { rub: 2000 },
	discount: { rub: 500 }
});

new game.PaymentItem({
	id: 'paymentCredits50000',
	name: '50000 ГГК',
	profit: {
		resources: { credits: 50000 }
	},
	cost: { rub: 3750 },
	discount: { rub: 1250 }
});

}