initChatServer = function() {

initChatLib();

Game.Chat.Messages.Collection._ensureIndex({
	room_id: 1,
	timestamp: -1
});

Game.Chat.Room.Collection._ensureIndex({
	name: 1
});

// create defaul rooms on server startup
var createDefaulRoom = function(name) {
	if (!Game.Chat.Room.Collection.findOne({ name: name })) {
		Game.Chat.Room.Collection.insert({
			name: name,
			isPublic: true
		});
	}
};

createDefaulRoom('general');
createDefaulRoom('help');

Meteor.methods({
	'chat.sendMessage': function(message, roomName) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		// check global block
		var blockGlobal = Game.BanHistory.Collection.findOne({
			user_id: user._id,
			type: Game.BanHistory.type.chat,
			room_id: { $exists: false }
		}, {
			sort: {
				timestamp: -1
			}
		});

		if (blockGlobal && Game.getCurrentTime() < blockGlobal.timestamp + blockGlobal.period) {
			throw new Meteor.Error('Чат заблокирован', blockGlobal.timestamp + blockGlobal.period);
		}

		// check room name
		check(roomName, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName,
			deleted: { $ne: true }
		});
		
		if (!room) {
			throw new Meteor.Error('Нет такой комнаты');
		}

		if (!room.isPublic && room.users.indexOf(user._id) == -1) {
			throw new Meteor.Error('Вы не можете писать в эту комнату');
		}

		// check room block
		var blockRoom = Game.BanHistory.Collection.findOne({
			user_id: user._id,
			type: Game.BanHistory.type.chat,
			room_id: room._id
		}, {
			sort: {
				timestamp: -1
			}
		});

		if (blockRoom && Game.getCurrentTime() < blockRoom.timestamp + blockRoom.period) {
			throw new Meteor.Error('Чат ' + roomName + ' заблокирован', blockRoom.timestamp + blockRoom.period);
		}

		// check message
		check(message, String);

		message = sanitizeHtml(message.trim().substr(0, 140), {
			allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'sub', 'sup', 's', 'strike' ],
			allowedAttributes: {
				'a': [ 'href' ]
			}
		}).trim();

		if (message.length === 0) {
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
			room_id: room._id,
			user_id: user._id,
			username: user.username,
			alliance: user.alliance,
			message: message,
			timestamp: Game.getCurrentTime()
		};

		if (user.role) {
			set.role = user.role;
		}

		if (message.substr(0, 1) == '/') {
			var reg = new RegExp(/^\/d (\d )?(\d{1,2})$/);
			if (message == '/d' || reg.test(message)) {

				var dices = 1;
				var edges = 6;

				if (message != '/d') {
					var dice = reg.exec(message);
					dices = dice[1] === undefined ? 1 : (parseInt(dice[1]) || 1);
					edges = parseInt(dice[2]) < 2 ? 2 : parseInt(dice[2]);
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
				};

			} else if (message.substr(0, 3) == '/me') {
				set.data = {
					type: 'status'
				};
				set.message = message.substr(3);

			} else if(message.substr(0, 5) == '/motd') {
				if (['admin', 'helper'].indexOf(user.role) == -1
				 && room.owner != user._id
				 && (!room.moderators || room.moderators.indexOf(user.username) == -1)
				) {
					throw new Meteor.Error('Вы не можете устанавливать сообщение дня в этот чат');
				}

				set.message = message.substr(5).trim();

			} else if (message.substr(0, 8) == '/сепукку') {
				if (userResources.crystals.amount < 0
				 || userResources.metals.amount < 0
				 || userResources.honor.amount < 0
				) {
					throw new Meteor.Error('Вы слишком бедны что бы совершать сепукку');
				}

				set.data = {
					type: 'sepukku'
				};
				set.message = message.substr(8);

				var income = Game.Resources.getIncome();

				var doSepukku = function(uid, metals, crystals) {
					Game.Resources.spend({
						metals: {amount: metals},
						crystals: {amount: crystals},
						honor: 100
					}, uid);
				};

				for (var i = 3; i < 13; i++) {
					Meteor.setTimeout(doSepukku.bind(
						this,
						Meteor.userId(),
						Math.max(Math.floor(Game.Resources.getIncome().metals * 0.33), 100),
						Math.max(Math.floor(Game.Resources.getIncome().crystals * 0.33), 100)
					), i * 1000);
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
					_id: room._id
				}, {
					$inc: { credits: price.credits * -1 }
				});
			} else {
				Game.Resources.spend(price);
			}
		}

		// insert message
		if (message.substr(0, 5) == '/motd') {
			Game.Chat.Room.Collection.update({
				_id: room._id
			}, {
				$set: {
					motd: (set.message.length > 0 ? set : null)
				}
			});
		} else {
			Game.Chat.Messages.Collection.insert(set);
		}
	},

	'chat.blockUser': function(options) {
		var user = Meteor.user();

		if (!user && !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (!options || !options.username) {
			throw new Meteor.Error('Не указан логин');
		}

		check(options.username, String);

		var room = null;

		if (options.roomName) {
			check(options.roomName, String);

			room = Game.Chat.Room.Collection.findOne({
				name: options.roomName,
				deleted: { $ne: true }
			});

			if (!room) {
				throw new Meteor.Error('Нет такой комнаты');
			}

			// local block
			if (['admin', 'helper'].indexOf(user.role) == -1
			 && room.owner != user._id
			 && (!room.moderators || room.moderators.indexOf(user.username) == -1)
			) {
				throw new Meteor.Error('Вы не можете наказывать и прощать пользователей в этом чате');
			}

		} else {
			// global block
			if (['admin', 'helper'].indexOf(user.role) == -1) {
				throw new Meteor.Error('Вы не можете наказывать и прощать пользователей глобально');
			}
		}

		var target = Meteor.users.findOne({
			username: options.username
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
			who: user.username,
			timestamp: Game.getCurrentTime(),
			period: time
		};

		if (options.roomName) {
			history.room_id = room._id;
		}

		Game.BanHistory.Collection.insert(history);

		// send message
		if (options.roomName) {
			Game.Chat.Messages.Collection.insert({
				room_id: room._id,
				user_id: user._id,
				username: user.username,
				alliance: user.alliance,
				data: {
					type: time <= 0 ? 'unblock' : 'block',
					timestamp: Game.getCurrentTime(),
					period: time
				},
				message: target.username,
				timestamp: Game.getCurrentTime()
			});
		} else {
			var rooms = Game.Chat.Room.Collection.find({
				deleted: { $ne: true },
				$or: [
					{ users: { $in: [ target._id ] } },
					{ isPublic: true }
				]
			}).fetch();

			for (var i = 0; i < rooms.length; i++) {
				Game.Chat.Messages.Collection.insert({
					room_id: rooms[i]._id,
					user_id: user._id,
					username: user.username,
					alliance: user.alliance,
					data: {
						type: time <= 0 ? 'unblock' : 'block',
						timestamp: Game.getCurrentTime(),
						period: time,
						global: true
					},
					message: target.username,
					timestamp: Game.getCurrentTime()
				});
			}
		}
	},

	'chat.banAccount': function(username) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (['admin'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
		}

		var target = Meteor.users.findOne({
			username: username
		});

		if (!target) {
			throw new Meteor.Error('Некорректно указан логин');
		}

		Meteor.users.update({_id: target._id}, {
			$set: {
				blocked: true
			}
		});
	},

	'chat.cheaterVaip': function(username) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (['admin'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
		}

		var target = Meteor.users.findOne({
			username: username
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
  		});

		Meteor.users.update({_id: target._id}, {
			$set: {
				rating: 1,
				cheater: true
			}
		});
	},

	'chat.createRoom': function(name, isPublic, isOwnerPays) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		// check room name
		check(name, String);

		if (name.length > 32) {
			throw new Meteor.Error('Имя комнаты должно быть не длиннее 32 символов');
		}

		if (!name.match(/^[a-zA-Z0-9_\-]+$/)) {
			throw new Meteor.Error('Имя комнаты должно состоять только из латинских букв, цифр, дефисов и подчеркиваний');
		}

		var room = Game.Chat.Room.Collection.findOne({
			name: name,
			deleted: { $ne: true }
		});

		if (room) {
			throw new Meteor.Error('Коната с именем ' + name + ' уже существует');
		}

		// prepare room
		room = {
			name: name,
			owner: user._id
		};

		if (isOwnerPays) {
			room.isOwnerPays = true;
			room.credits = 0;
		}

		if (isPublic) {
			room.isPublic = true;
		} else {
			room.users = [ user._id ];
			room.usernames = [ user.username ];
		}

		// check price
		var price = Game.Chat.Room.getPrice(room);

		if (price) {
			var userResources = Game.Resources.getValue();
			for (var resid in price) {
				if (!userResources[resid] || userResources[resid].amount < price[resid]) {
					throw new Meteor.Error('Недостаточно средств для создания комнаты');
				}
			}

			Game.Resources.spend(price);
		}

		Game.Chat.Room.Collection.insert(room);
	},

	'chat.removeRoom': function(name) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(name, String);

		if (['general', 'help'].indexOf(name) != -1) {
			throw new Meteor.Error('Что этот ниггер себе позволяет!');
		}

		var room = Game.Chat.Room.Collection.findOne({
			name: name,
			deleted: { $ne: true }
		});

		if (!room) {
			throw new Meteor.Error('Коната с именем ' + name + ' не существует');
		}

		if (user.role != 'admin' && room.owner != user._id) {
			throw new Meteor.Error('Вы не можете удалить эту комнату');
		}

		Game.Chat.Room.Collection.update({
			_id: room._id
		}, {
			$set: { deleted: true }
		});
	},

	'chat.buyFreeChat': function() {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		var resources = Game.Resources.getValue();

		if (resources.credits.amount < Game.Chat.Messages.FREE_CHAT_PRICE) {
			throw new Meteor.Error('Недостаточно средств');
		}

		Game.Resources.spend({ credits: Game.Chat.Messages.FREE_CHAT_PRICE });

		Game.Payment.logExpense({
			resources: { credits: Game.Chat.Messages.FREE_CHAT_PRICE }
		}, {
			type: 'chatFree'
		});

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

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(credits, Match.Integer);

		if (credits < 100) {
			throw new Meteor.Error('Минимальная сумма составляет 100 грязных галлактических кредитов');
		}

		check(roomName, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName,
			deleted: { $ne: true }
		});

		if (!room) {
			throw new Meteor.Error('Коната с именем ' + roomName + ' не существует');
		}

		if (!room.isOwnerPays) {
			throw new Meteor.Error('Невозможно пополнить баланс этой комнаты');
		}

		var userResources = Game.Resources.getValue();
		if (userResources.credits.amount < credits) {
			throw new Meteor.Error('У вас недостаточно средств');
		}

		Game.Chat.Room.Collection.update({
			_id: room._id
		}, {
			$inc: { credits: credits }
		});

		Game.Resources.spend({ credits: credits });

		Game.Payment.logExpense({
			resources: { credits: credits }
		}, {
			type: 'chatBalance',
			room: room._id
		});

		Game.Chat.Messages.Collection.insert({
			room_id: room._id,
			user_id: user._id,
			username: user.username,
			alliance: user.alliance,
			data: {
				type: 'addfunds',
				amount: credits
			},
			timestamp: Game.getCurrentTime()
		});
	},

	'chat.addModeratorToRoom': function(roomName, username) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(roomName, String);
		check(username, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName,
			deleted: { $ne: true }
		});

		if (!room) {
			throw new Meteor.Error('Коната с именем ' + roomName + ' не существует');
		}

		if (user.role != 'admin' && room.owner != user._id) {
			throw new Meteor.Error('Вы не можете назначать модераторов в этой комнате');
		}

		if (!room.isPublic) {
			if (room.usernames.indexOf(username) == -1) {
				throw new Meteor.Error('Сначала нужно добавить пользователя в комнату');
			}
		}

		if (room.moderators && room.moderators.length >= Game.Chat.Room.MODERATORS_LIMIT) {
			throw new Meteor.Error('В комнату нельзя добавить больше ' + Game.Chat.Room.MODERATORS_LIMIT + ' модераторов');
		}

		var target = Meteor.users.findOne({
			username: username
		});

		if (!target) {
			throw new Meteor.Error('Пользователя с таким именем не существует');
		}

		if (room.moderators && room.moderators.indexOf( target.username ) != -1) {
			throw new Meteor.Error('Такой модератор уже есть в чате');
		}

		Game.Chat.Room.Collection.update({
			_id: room._id
		}, {
			$addToSet: {
				moderators: target.username
			}
		});

		Game.Chat.Messages.Collection.insert({
			room_id: room._id,
			user_id: user._id,
			username: user.username,
			alliance: user.alliance,
			data: {
				type: 'addModerator'
			},
			message: target.username,
			timestamp: Game.getCurrentTime()
		});
	},

	'chat.removeModeratorFromRoom': function(roomName, username) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(roomName, String);
		check(username, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName,
			deleted: { $ne: true }
		});

		if (!room) {
			throw new Meteor.Error('Коната с именем ' + roomName + ' не существует');
		}

		if (user.role != 'admin' && room.owner != user._id) {
			throw new Meteor.Error('Вы не можете удалять модераторов из этой комнаты');
		}

		if (!room.moderators || room.moderators.indexOf( username ) == -1) {
			throw new Meteor.Error('Такого модератора в комнате нет');
		}

		Game.Chat.Room.Collection.update({
			_id: room._id
		}, {
			$pull: {
				moderators: username
			}
		});

		Game.Chat.Messages.Collection.insert({
			room_id: room._id,
			user_id: user._id,
			username: user.username,
			alliance: user.alliance,
			data: {
				type: 'removeModerator'
			},
			message: username,
			timestamp: Game.getCurrentTime()
		});
	},

	'chat.addUserToRoom': function(roomName, username) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(roomName, String);
		check(username, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName,
			deleted: { $ne: true }
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
			username: username
		});

		if (!target) {
			throw new Meteor.Error('Пользователя с таким именем не существует');
		}

		if (room.users.indexOf( target._id ) != -1) {
			throw new Meteor.Error('Пользователь уже в чате');
		}

		Game.Chat.Room.Collection.update({
			_id: room._id
		}, {
			$addToSet: {
				users: target._id,
				usernames: target.username
			}
		});

		Game.Chat.Messages.Collection.insert({
			room: room._id,
			user_id: user._id,
			username: user.username,
			alliance: user.alliance,
			data: {
				type: 'add'
			},
			message: target.username,
			timestamp: Game.getCurrentTime()
		});
	},

	'chat.removeUserFromRoom': function(roomName, username) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(roomName, String);
		check(username, String);

		var room = Game.Chat.Room.Collection.findOne({
			name: roomName,
			deleted: { $ne: true }
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
			username: username
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
			_id: room._id
		}, {
			$pull: {
				users: target._id,
				usernames: target.username,
				moderators: target.username
			}
		});

		Game.Chat.Messages.Collection.insert({
			room_id: room._id,
			user_id: user._id,
			username: user.username,
			alliance: user.alliance,
			data: {
				type: 'remove'
			},
			message: target.username,
			timestamp: Game.getCurrentTime()
		});
	},

	'chat.loadMore': function(options) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(options, Object);
		check(options.roomName, String);
		check(options.timestamp, Match.Integer);

		var room = Game.Chat.Room.Collection.findOne({
			name: options.roomName,
			deleted: { $ne: true },
			$or: [
				{ users: { $in: [ user._id ] } },
				{ isPublic: true }
			]
		});

		if (!room) {
			throw new Meteor.Error('Нет такой комнаты');
		}

		var timeCondition = { $gt: Game.getCurrentTime() - 84600 };

		if (options.isPrevious) {
			timeCondition.$lte = options.timestamp;
		} else {
			timeCondition.$gte = options.timestamp;
		}

		return Game.Chat.Messages.Collection.find({
			room_id: room._id,
			timestamp: timeCondition
		}, {
			fields: {
				_id: 1,
				username: 1,
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
			deleted: { $ne: true },
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
			deleted: { $ne: true },
			$or: [
				{ users: { $in: [ this.userId ] } },
				{ isPublic: true }
			]
		});

		if (room) {
			return Game.Chat.Messages.Collection.find({
				room_id: room._id,
				timestamp: { $gt: Game.getCurrentTime() - 84600 }
			}, {
				fields: {
					_id: 1,
					username: 1,
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

};