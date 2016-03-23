initPaymentLib = function() {

game.PaymentItem = function(options) {
	this.id = options.id;
	this.name = options.name;
	this.resources = options.resources;
	this.cost = options.cost;

	Game.Payment.items[options.id] = this;
}

Game.Payment = {
	items: {}
}

// TODO: Заполнить платежки
new game.PaymentItem({
	id: 'paymentCredits100',
	name: '100 ГГК',
	resources: { credits: 100 },
	cost: { rub: 100 }
});

new game.PaymentItem({
	id: 'paymentCredits500',
	name: '500 ГГК',
	resources: { credits: 500 },
	cost: { rub: 500 }
});

new game.PaymentItem({
	id: 'paymentCredits2500',
	name: '2500 ГГК',
	resources: { credits: 2500 },
	cost: { rub: 2500 }
});

}