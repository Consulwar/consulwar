Meteor.startup(function () {

Meteor.methods({
	sendMessage: function(message) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(message, String);

		message = sanitizeHtml(message.trim().substr(0, 140), {
			allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'sub', 'sup', 's', 'strike' ],
			allowedAttributes: {
				'a': [ 'href' ]
			}
		}).trim();

		if (message.length == 0) {
			throw new Meteor.Error('Напиши хоть что-нибудь что бы отправить сообщение!');
		}

		if (user.muted == true) {
			throw new Meteor.Error('Чат заблокирован');
		}

		var price = Game.Chat.getMessagePrice();

		var resources = Game.Resources.getValue();

		if (resources.crystals.amount < price) {
			throw new Meteor.Error("Not enough resources");
		}
/*
		var set = {
			'game.resources.crystals.amount': user.game.resources.crystals.amount - price
		}

		console.log(set);

		Meteor.users.update({'_id': Meteor.userId()}, {
			$set: set
		});*/
		var set = {
			user_id: user._id,
			login: user.login,
			alliance: user.alliance,
			//type: user.type,
			message: message,
			timestamp: Math.floor(new Date().valueOf() / 1000)
		};

		if (user.role) {
			set.role = user.role;
		}

		if (message.substr(0, 1) == '/') {
			var reg = new RegExp(/^\/d (\d )?(\d{1,2})$/);
			if (message == '/d' || reg.test(message)) {
				if (message == '/d') {
					var dices = 1;
					var edges = 6;
				} else {
					var dice = reg.exec(message);

					var dices = dice[1] == undefined ? 1 : (parseInt(dice[1]) || 1);
					var edges = parseInt(dice[2]) < 2 ? 2 : parseInt(dice[2]);
				}

				set.data = {
					type: 'dice',
					dice: {
						dices: {
							amount: dices,
							values: _.map(_.range(dices), function() {
								return _.random(1, edges);
							})
						},
						edges: edges
					}
				}

				//console.log(set.data);
			} else if (message.substr(0, 3) == '/me') {
				set.data = {
					type: 'status'
				}
				set.message = message.substr(3);
			} else if (message.substr(0, 8) == '/сепукку') {
				if (resources.crystals.amount < 0 || resources.metals.amount < 0 || resources.honor.amount < 0) {
					throw new Meteor.Error('Вы слишком бедны что бы совершать сепукку');
				}

				set.data = {
					type: 'sepukku'
				}
				set.message = message.substr(8);

				var income = Game.Resources.getIncome();

				for(var i = 3; i < 13; i++) {
					Meteor.setTimeout(function(uid, metals, crystals) {
						Game.Resources.spend({
							metals: {amount: metals},
							crystals: {amount: crystals},
							honor: 100
						}, uid);
					}.bind(
						this, 
						Meteor.userId(),
						Math.max(Math.floor(Game.Resources.getIncome().metals * 0.33), 100),
						Math.max(Math.floor(Game.Resources.getIncome().crystals * 0.33), 100)
					),
					i * 1000);
				}
			}
		}

		if (set.data && set.data.type == 'dice') {
			price = 5000 * set.data.dice.dices.amount;
		}

		if (resources.crystals.amount < price) {
			throw new Meteor.Error("Not enough resources");
		}
		
		Game.Resources.spend({crystals: price});

		Game.Chat.Collection.insert(set);
	},

	blockOrUnblockChatTo: function(login) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (!(user && ['admin', 'helper'].indexOf(user.role) != -1)) {
			throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
		}

		var target = Meteor.users.findOne({login: login});

		if (!target) {
			throw new Meteor.Error('Некорректно указан логин');
		}

		Meteor.users.update({_id: target._id}, {
			$set: {
				muted: target.muted ? false : true
			}
		})

		Game.Chat.Collection.insert({
			user_id: user._id,
			login: user.login,
			alliance: user.alliance,
			data: {
				type: target.muted ? 'unblock' : 'block'
			},
			message: target.login,
			timestamp: Math.floor(new Date().valueOf() / 1000)
		});
	},

	banAccount: function(login) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (!(user && ['admin'].indexOf(user.role) != -1)) {
			throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
		}

		var target = Meteor.users.findOne({login: login});


		if (!target) {
			throw new Meteor.Error('Некорректно указан логин');
		}

		Meteor.users.update({_id: target._id}, {
			$set: {
				blocked: true
			}
		})
	},

	cheaterVaip: function(login) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (!(user && ['admin'].indexOf(user.role) != -1)) {
			throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
		}

		var target = Meteor.users.findOne({login: login});

		if (!target) {
			throw new Meteor.Error('Некорректно указан логин');
		}

		Battle.remove({user_id: target._id});

		Game.Building.Collection.remove({user_id: target._id});

		Game.Queue.Collection.remove({user_id: target._id});

		Game.Research.Collection.remove({user_id: target._id});

		Game.Unit.Collection.remove({user_id: target._id});

		Game.Investments.Collection.remove({user_id: target._id});
		
		Game.Resources.Collection.upsert({user_id: target._id}, {$set: {
			humans: {amount: 200},
			metals: {amount: 0},
			crystals: {amount: 0},
			credits: {amount: 0},
			honor: {amount: 0}
  		}})


		Meteor.users.update({_id: target._id}, {
			$set: {
				rating: 1,
				cheater: true
			}
		})
	}
})


Meteor.publish('chat', function () {
	if (this.userId) {
		return Game.Chat.Collection.find({}, {
			fields: {
				login: 1,
				message: 1,
				data: 1,
				timestamp: 1,
				alliance: 1,
				type: 1,
				role: 1,
				cheater: 1
			},
			sort: {
				timestamp: -1
			},
			limit: 200
		});
	} else {
		this.ready();
	}
});

Meteor.publish('online', function () {
	if (this.userId) {
		return Meteor.users.find({'status.online': true}, {
			fields: {
				login: 1,
				role: 1
			}
		})
	} else {
		this.ready();
	}
});

});