Meteor.startup(function () {

Meteor.methods({
	'chat.sendMessage': function(message, roomName) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		// check global block
		var blockGlobal = Game.BanHistory.Collection.findOne({
			user_id: user._id,
			type: Game.BanHistory.type.chat,
			room: { $exists: false }
		}, {
			sort: {
				timestamp: -1
			}
		});

		if (blockGlobal && Game.getCurrentTime() < blockGlobal.timestamp + blockGlobal.period) {
			throw new Meteor.Error('Чат заблокирован');
		}

		// check room block
		var blockRoom = Game.BanHistory.Collection.findOne({
			user_id: user._id,
			type: Game.BanHistory.type.chat,
			room: roomName
		}, {
			sort: {
				timestamp: -1
			}
		});

		if (blockRoom && Game.getCurrentTime() < blockRoom.timestamp + blockRoom.period) {
			throw new Meteor.Error('Чат ' + roomName + ' заблокирован');
		}

		// check room name
		check(roomName, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName
		});
		
		if (!room) {
			throw new Meteor.Error('Нет такой комнаты');
		}

		if (!room.isPublic && room.users.indexOf(user._id) == -1) {
			throw new Meteor.Error('Вы не можете писать в эту комнату');
		}

		// check message
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

		// calc price
		var price = Game.Chat.Messages.getPrice(room);
		var userResources = Game.Resources.getValue();

		if (room.isOwnerPays) {
			if (price && room.credits < price.credits) {
				throw new Meteor.Error('Нужно пополнить баланс комнаты');
			}
		} else {
			if (price && userResources.crystals.amount < price.crystals) {
				throw new Meteor.Error('У Вас недостаточно ресурсов');
			}
		}

		// send message
		var set = {
			room: roomName,
			user_id: user._id,
			login: user.login,
			alliance: user.alliance,
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

			} else if (message.substr(0, 3) == '/me') {
				set.data = {
					type: 'status'
				}
				set.message = message.substr(3);

			} else if (message.substr(0, 8) == '/сепукку') {
				if (userResources.crystals.amount < 0
				 || userResources.metals.amount < 0
				 || userResources.honor.amount < 0
				) {
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

		// dice price check and spend
		if (set.data && set.data.type == 'dice') {
			var dicePrice = 5000 * set.data.dice.dices.amount;

			if (userResources.crystals.amount < dicePrice) {
				throw new Meteor.Error('У вас не достаточно кристаллов чтобы бросить кубики');
			}

			Game.Resources.spend({ crystals: dicePrice });
		}

		// message price
		if (price) {
			if (room.isOwnerPays) {
				Game.Chat.Room.Collection.update({
					name: roomName
				}, {
					$inc: { credits: price.credits * -1 }
				})
			} else {
				Game.Resources.spend(price);
			}
		}

		Game.Chat.Messages.Collection.insert(set);
	},

	'chat.blockUser': function(options) {
		var user = Meteor.user();

		if (!user && !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (!options || !options.login) {
			throw new Meteor.Error('Не указан логин');
		}

		check(options.login, String);

		var hasAccess = ['admin', 'helper'].indexOf(user.role) != -1;

		if (options.roomName) {
			check(options.roomName, String);

			var room = Game.Chat.Room.Collection.findOne({
				name: options.roomName
			});

			if (!room) {
				throw new Meteor.Error('Нет такой комнаты');
			}

			if (!hasAccess && room.moderators) {
				hasAccess = (room.moderators.indexOf(user.login) != -1);
			}

			if (!hasAccess && !room.isPublic) {
				hasAccess = (room.owner == user._id);
			}
		}

		if (!hasAccess) {
			throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
		}

		var target = Meteor.users.findOne({
			login: options.login
		});

		if (!target) {
			throw new Meteor.Error('Некорректно указан логин');
		}

		if (options.time) {
			check(options.time, Match.Integer);
		}

		var time = options.time ? options.time : 0;

		var history = {
			user_id: target._id,
			type: Game.BanHistory.type.chat,
			who: user.login,
			timestamp: Game.getCurrentTime(),
			period: time
		}

		if (options.roomName) {
			history.room = options.roomName;
		}

		Game.BanHistory.Collection.insert(history);

		// send message
		if (options.roomName) {
			Game.Chat.Messages.Collection.insert({
				room: options.roomName,
				user_id: user._id,
				login: user.login,
				alliance: user.alliance,
				data: {
					type: time <= 0 ? 'unblock' : 'block',
					timestamp: Game.getCurrentTime()
				},
				message: target.login,
				timestamp: Math.floor(new Date().valueOf() / 1000)
			});
		} else {
			var rooms = Game.Chat.Room.Collection.find({
				isPublic: true
			}).fetch();

			for (var i = 0; i < rooms.length; i++) {
				Game.Chat.Messages.Collection.insert({
					room: rooms[i].name,
					user_id: user._id,
					login: user.login,
					alliance: user.alliance,
					data: {
						type: time <= 0 ? 'unblock' : 'block',
						timestamp: Game.getCurrentTime()
					},
					message: target.login,
					timestamp: Math.floor(new Date().valueOf() / 1000)
				});
			}
		}
	},

	'chat.banAccount': function(login) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (['admin'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
		}

		var target = Meteor.users.findOne({
			login: login
		});

		if (!target) {
			throw new Meteor.Error('Некорректно указан логин');
		}

		Meteor.users.update({_id: target._id}, {
			$set: {
				blocked: true
			}
		})
	},

	'chat.cheaterVaip': function(login) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (['admin'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
		}

		var target = Meteor.users.findOne({
			login: login
		});

		if (!target) {
			throw new Meteor.Error('Некорректно указан логин');
		}

		Battle.remove({user_id: target._id});

		Game.Building.Collection.remove({user_id: target._id});

		Game.Queue.Collection.remove({user_id: target._id});

		Game.Research.Collection.remove({user_id: target._id});

		Game.Unit.Collection.remove({user_id: target._id});

		Game.Investments.Collection.remove({user_id: target._id});
		
		Game.Resources.Collection.upsert({
			user_id: target._id
		}, {
			$set: {
				humans: {amount: 200},
				metals: {amount: 0},
				crystals: {amount: 0},
				credits: {amount: 0},
				honor: {amount: 0}
  			}
  		})

		Meteor.users.update({_id: target._id}, {
			$set: {
				rating: 1,
				cheater: true
			}
		})
	},

	'chat.createRoom': function(name, isPublic, isOwnerPays) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(name, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: name
		});

		if (room) {
			throw new Meteor.Error('Коната с именем ' + name + ' уже существует');
		}

		room = {};
		room.name = name;

		if (isPublic) {
			if (['admin'].indexOf(user.role) == -1) {
				throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
			}
			room.isPublic = true;
		} else {
			room.owner = user._id;
			room.users = [ user._id ];
			room.logins = [ user.login ];

			if (isOwnerPays) {
				room.isOwnerPays = true;
				room.credits = 0;
			}
		}

		Game.Chat.Room.Collection.insert(room);
	},

	'chat.removeRoom': function(name) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(name, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: name
		});

		if (!room) {
			throw new Meteor.Error('Коната с именем ' + name + ' не существует');
		}

		if (room.isPublic) {
			if (['admin'].indexOf(user.role) == -1) {
				throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
			}
		} else {
			if (room.owner != user._id) {
				throw new Meteor.Error('Это не твоя комната.');
			}
		}

		Game.Chat.Room.Collection.remove({
			name: name
		});

		Game.Chat.Messages.Collection.remove({
			room: name
		});
	},

	'chat.buyFreeChat': function() {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		var resources = Game.Resources.getValue();

		if (resources.credits.amount < 5000) {
			throw new Meteor.Error('Недостаточно средств');
		}

		Game.Resources.spend({ credits: 5000 });

		Meteor.users.update({
			_id: user._id
		}, {
			$set: { isChatFree: true }
		});
	},

	'chat.addCreditsToRoom': function(roomName, credits) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(credits, Match.Integer);

		if (credits < 100) {
			throw new Meteor.Error('Минимальная сумма составляет 100 грязных галлактических кредитов');
		}

		check(roomName, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName
		});

		if (!room) {
			throw new Meteor.Error('Коната с именем ' + roomName + ' не существует');
		}

		if (room.isPublic || !room.isOwnerPays) {
			throw new Meteor.Error('Невозможно пополнить баланс этой комнаты');
		}

		var userResources = Game.Resources.getValue();
		if (userResources.credits.amount < credits) {
			throw new Meteor.Error('У вас недостаточно средств');
		}

		Game.Chat.Room.Collection.update({
			name: roomName
		}, {
			$inc: { credits: credits }
		});

		Game.Resources.spend({ credits: credits });

		Game.Chat.Messages.Collection.insert({
			room: roomName,
			user_id: user._id,
			login: user.login,
			alliance: user.alliance,
			data: {
				type: 'addfunds',
				amount: credits
			},
			timestamp: Math.floor(new Date().valueOf() / 1000)
		});
	},

	'chat.addModeratorToRoom': function(roomName, login) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(roomName, String);
		check(login, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName
		});

		if (!room) {
			throw new Meteor.Error('Коната с именем ' + roomName + ' не существует');
		}

		if (room.isPublic) {
			if (['admin'].indexOf(user.role) == -1) {
				throw new Meteor.Error('Только админстратор может назначить модератора в публичной комнате');
			}
		} else {
			if (room.owner != user._id) {
				throw new Meteor.Error('Только владелец может назанчить модератора в приватной комнате');
			}

			if (room.logins.indexOf(login) == -1) {
				throw new Meteor.Error('Сначала нужно добавить пользователя в комнату');
			}
		}

		if (!room.moderators) {
			room.moderators = [];
		}

		if (room.moderators.length >= Game.Chat.Room.MODERATORS_LIMIT) {
			throw new Meteor.Error('В комнату нельзя добавить больше ' + Game.Chat.Room.MODERATORS_LIMIT + ' модераторов');
		}

		var target = Meteor.users.findOne({
			login: login
		});

		if (!target) {
			throw new Meteor.Error('Пользователя с таким именем не существует');
		}

		if (room.moderators.indexOf( target._id ) != -1) {
			throw new Meteor.Error('Такой модератор уже есть в чате');
		}

		Game.Chat.Room.Collection.update({
			name: roomName
		}, {
			$addToSet: {
				moderators: target.login
			}
		});
	},

	'chat.removeModeratorFromRoom': function(roomName, login) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(roomName, String);
		check(login, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName
		});

		if (!room) {
			throw new Meteor.Error('Коната с именем ' + roomName + ' не существует');
		}

		if (room.isPublic) {
			if (['admin'].indexOf(user.role) == -1) {
				throw new Meteor.Error('Только админстратор может назначить модератора в публичной комнате');
			}
		} else {
			if (room.owner != user._id) {
				throw new Meteor.Error('Только владелец может назанчить модератора в приватной комнате');
			}
		}

		if (room.moderators.indexOf( target.login ) == -1) {
			throw new Meteor.Error('Такого модератора в чате нет');
		}

		Game.Chat.Room.Collection.update({
			name: roomName
		}, {
			$pull: {
				moderators: login
			}
		});
	},

	'chat.addUserToRoom': function(roomName, login) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(roomName, String);
		check(login, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName
		});

		if (!room) {
			throw new Meteor.Error('Коната с именем ' + roomName + ' не существует');
		}

		if (room.isPublic) {
			throw new Meteor.Error('Невозможно добавить пользователя');
		}

		if (room.owner != user._id) {
			throw new Meteor.Error('Это не твоя комната');
		}

		if (room.users.length >= Game.Chat.Room.USERS_LIMIT) {
			throw new Meteor.Error('В комнату нельзя добавить больше ' + Game.Chat.Room.USERS_LIMIT + ' пользователей');
		}

		var target = Meteor.users.findOne({
			login: login
		});

		if (!target) {
			throw new Meteor.Error('Пользователя с таким именем не существует');
		}

		if (room.users.indexOf( target._id ) != -1) {
			throw new Meteor.Error('Пользователь уже в чате');
		}

		Game.Chat.Room.Collection.update({
			name: roomName
		}, {
			$addToSet: {
				users: target._id,
				logins: target.login
			}
		});

		Game.Chat.Messages.Collection.insert({
			room: roomName,
			user_id: user._id,
			login: user.login,
			alliance: user.alliance,
			data: {
				type: 'add'
			},
			message: target.login,
			timestamp: Math.floor(new Date().valueOf() / 1000)
		});
	},

	'chat.removeUserFromRoom': function(roomName, login) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(roomName, String);
		check(login, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName
		});

		if (!room) {
			throw new Meteor.Error('Коната с именем ' + roomName + ' не существует');
		}

		if (room.isPublic) {
			throw new Meteor.Error('Невозможно удалить пользователя');
		}

		if (room.owner != user._id) {
			throw new Meteor.Error('Это не твоя комната');
		}

		var target = Meteor.users.findOne({
			login: login
		});

		if (!target) {
			throw new Meteor.Error('Пользователя с таким именем не существует');
		}

		if (room.owner == target._id) {
			throw new Meteor.Error('Зачем?');
		}

		if (room.users.indexOf( target._id ) == -1) {
			throw new Meteor.Error('Такого пользователя нет в чате');
		}

		Game.Chat.Room.Collection.update({
			name: roomName
		}, {
			$pull: {
				users: target._id,
				logins: target.login
			}
		});

		Game.Chat.Messages.Collection.insert({
			room: roomName,
			user_id: user._id,
			login: user.login,
			alliance: user.alliance,
			data: {
				type: 'remove'
			},
			message: target.login,
			timestamp: Math.floor(new Date().valueOf() / 1000)
		});
	},

	'chat.loadMore': function(roomName, timestamp) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(roomName, String);
		check(timestamp, Match.Integer);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName,
			$or: [
				{ users: { $in: [ user._id ] } },
				{ isPublic: true }
			]
		});

		if (!room) {
			throw new Meteor.Error('Нет такой комнаты');
		}

		return Game.Chat.Messages.Collection.find({
			room: roomName,
			timestamp: {
				$lt: timestamp,
				$gt: Game.getCurrentTime() - 84600
			}
		}, {
			fields: {
				login: 1,
				message: 1,
				data: 1,
				timestamp: 1,
				alliance: 1,
				type: 1,
				role: 1,
				cheater: 1,
				room: 1
			},
			sort: {
				timestamp: -1
			},
			limit: Game.Chat.Messages.LOAD_COUNT
		}).fetch();
	}
});

Meteor.publish('chatRoom', function(roomName) {
	if (this.userId) {
		check(roomName, String);
		return Game.Chat.Room.Collection.find({
			name: roomName,
			$or: [
				{ users: { $in: [ this.userId ] } },
				{ isPublic: true }
			]
		});
	} else {
		this.ready();
	}
});

Meteor.publish('chat', function (roomName) {
	if (this.userId) {
		check(roomName, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName,
			$or: [
				{ users: { $in: [ this.userId ] } },
				{ isPublic: true }
			]
		});

		if (room) {
			return Game.Chat.Messages.Collection.find({
				room: roomName,
				timestamp: { $gt: Game.getCurrentTime() - 84600 }
			}, {
				fields: {
					login: 1,
					message: 1,
					data: 1,
					timestamp: 1,
					alliance: 1,
					type: 1,
					role: 1,
					cheater: 1,
					room: 1
				},
				sort: {
					timestamp: -1
				},
				limit: Game.Chat.Messages.LOAD_COUNT
			});
		}
	} else {
		this.ready();
	}
});

});