initMutualServerMethods = function(){
'use strict';

Meteor.methods({
	'mutual.invest': function(options) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		Game.Log('mutual.invest');

		if (Game.User.getLevel() < 1) {
			throw new Meteor.Error('Чтобы участвовать в общих исследованиях нужно подрости');
		}

		check(options, Object);
		check(options.group, String);
		check(options.engName, String);

		check(options.investments, Number);
		check(options.currency, String);
		options.investments = parseInt(options.investments);
		if (options.investments < 1 || _.isNaN(options.investments) || (options.currency != 'resources' && options.currency != 'credits')) {
			throw new Meteor.Error('Не умничай');
		}

		Meteor.call('actualizeGameInfo');

		var item = Game.Mutual.items[options.group] && Game.Mutual.items[options.group][options.engName];

		if (!item) {
			throw new Meteor.Error('Вот жеж ты жук! И чего ты ожидал то?');
		}

		var maxInvestmentsPerUser = Math.floor(item.investments / 5);

		if (options.investments > maxInvestmentsPerUser) {
			options.investments = maxInvestmentsPerUser;
		}

		var leftInvestments = item.investments - item.currentInvestments();

		var userInvestments = Game.Investments.getValue(item);
		if (userInvestments) {
			if (userInvestments.investments >= maxInvestmentsPerUser) {
				throw new Meteor.Error('Один человек может вложить максимум 20%');
			} else {
				options.investments = Math.min(maxInvestmentsPerUser - userInvestments.investments, options.investments);
			}
		}

		if (leftInvestments < 1) {
			throw new Meteor.Error('Вклады более не принимаются');
		}

		if (!item.canBuild(options.investments, options.currency)) {
			throw new Meteor.Error('Невозможно сделать вклад');
		}

		if (options.investments > leftInvestments) {
			options.investments = leftInvestments;
		}

		var price = item.price(options.investments);

		if (options.currency == 'credits') {
			price = {
				credits: price.credits
			};
		} else {
			delete price.credits;
		}

		var set = {
			group: item.group,
			engName: item.engName,
			investments: options.investments,
			price: price
		};

		Game.Resources.spend(price);

		if (price.credits) {
			Game.Payment.Expense.log(price.credits, 'mutualInvest', {
				group: set.group,
				name: set.engName,
				count: set.investments
			});
		}

		var honor = Game.Resources.calculateHonorFromMutualResearch(price);
		if (honor > 0) {
			Game.Resources.add({ honor: honor });
		}

		Game.Investments.add(set);
	}
});

};