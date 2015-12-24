initResearchServerMethods = function(){

Meteor.methods({
	'research.start': function(options) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('research: ', new Date(), user.login);

		check(options, Object);
		check(options.group, String);
		check(options.engName, String);

		Meteor.call('actualizeGameInfo');

		var item = Game.Research.items[options.group] && Game.Research.items[options.group][options.engName];

		if (item && item.canBuild()) {

			var resources = Game.Resources.getValue();

			var set = {
				type: item.type,
				group: item.group,
				engName: item.engName,
				level: item.currentLevel() + 1
			};

			if (set.level > item.maxLevel) {
				throw new Meteor.Error("Исследование уже максимального уровня");
			}

			var price = item.price();
			
			set.time = price.time;

			Game.Queue.add(set);

			set = {};

			var rating = 0;

			if (price['metals']) {
				rating += price['metals'];
			}

			if (price['crystals']) {
				rating += price['crystals'] * 3;
			}

			if (price['humans']) {
				rating += price['humans'] * 4;
			}

			if (price['honor']) {
				rating += price['honor'] * 5;
			}

			set['rating'] = (user.rating || 0) + Math.floor(rating / 100);

			Game.Resources.spend(price);

			Meteor.users.update({'_id': Meteor.userId()}, {
				$set: set
			}); 
		} else {
			throw new Meteor.Error('Исследование невозможно');
		}
	}
})

}