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

		if (user.chatBlockedUntil && user.chatBlockedUntil > Game.getCurrentTime()) {
			throw new Meteor.Error('Чат заблокирован');
		}

		// check room name
		check(roomName, String);

		var room = Game.ChatRoom.Collection.findOne({
			name: roomName
		});
		
		if (!room) {
			throw new Meteor.Error('Нет такой комнаты');
		}

		if (!room.isPublic && room.users.indexOf(user._id) == -1) {
			throw new Meteor.Error('Вы не можете писать в эту комнату');
		}

		if (room.blocked
		 && room.blocked[user.login]
		 && room.blocked[user.login] > Game.getCurrentTime()
		) {
			throw new Meteor.Error('Чат ' + roomName + ' заблокирован');
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
		var price = Game.Chat.getMessagePrice();
		var payerId = (!room.isPublic && room.isOwnerPays) ? room.owner : user._id;
		var payerResources = Game.Resources.getValue(payerId);

		if (payerResources.crystals.amount < price) {
			if (payerId == user._id) {
				throw new Meteor.Error('У Вас недостаточно ресурсов');
			} else {
				throw new Meteor.Error('У владельца чата недостаточно ресурсов');
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
				var userResources = Game.Resources.getValue();

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

		if (set.data && set.data.type == 'dice') {
			price = 5000 * set.data.dice.dices.amount;
		}

		if (payerResources.crystals.amount < price) {
			if (payerId == user._id) {
				throw new Meteor.Error('У Вас недостаточно ресурсов');
			} else {
				throw new Meteor.Error('У владельца чата недостаточно ресурсов');
			}
		}
		
		Game.Resources.spend({crystals: price}, payerId);

		Game.Chat.Collection.insert(set);
	},

	'chat.blockUser': function(login, time, roomName) {
		var user = Meteor.user();

		if (!user && !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		var hasAccess = ['admin', 'helper'].indexOf(user.role) != -1;

		if (roomName) {
			check(roomName, String);

			var room = Game.ChatRoom.Collection.findOne({
				name: roomName
			});

			if (!room) {
				throw new Meteor.Error('Нет такой комнаты');
			}

			if (!room.isPublic && !hasAccess) {
				hasAccess = room.owner == user._id;
			}
		}

		if (!hasAccess) {
			throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
		}

		var target = Meteor.users.findOne({
			login: login
		});

		if (!target) {
			throw new Meteor.Error('Некорректно указан логин');
		}

		check(time, Match.Integer);

		var timestamp = Game.getCurrentTime() + time;

		if (roomName) {
			// room block
			var blocked = room.blocked ? room.blocked : {};
			blocked[ login ] = timestamp;

			Game.ChatRoom.Collection.update({
				name: roomName
			}, {
				$set: { blocked: blocked }
			});

			// send message
			Game.Chat.Collection.insert({
				room: roomName,
				user_id: user._id,
				login: user.login,
				alliance: user.alliance,
				data: {
					type: time <= 0 ? 'unblock' : 'block',
					timestamp: timestamp
				},
				message: target.login,
				timestamp: Math.floor(new Date().valueOf() / 1000)
			});

		} else {
			// general block
			Meteor.users.update({
				_id: target._id
			}, {
				$set: {
					chatBlockedUntil: timestamp
				}
			});

			// send messages
			var rooms = Game.ChatRoom.Collection.find().fetch();

			for (var i = 0; i < rooms.length; i++) {
				Game.Chat.Collection.insert({
					room: rooms[i].name,
					user_id: user._id,
					login: user.login,
					alliance: user.alliance,
					data: {
						type: time <= 0 ? 'unblock' : 'block',
						timestamp: timestamp
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

		var room = Game.ChatRoom.Collection.findOne({
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
			}
		}

		Game.ChatRoom.Collection.insert(room);
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

		var room = Game.ChatRoom.Collection.findOne({
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

		Game.ChatRoom.Collection.remove({
			name: name
		});

		Game.Chat.Collection.remove({
			room: name
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

		var room = Game.ChatRoom.Collection.findOne({
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

		var target = Meteor.users.findOne({
			login: login
		});

		if (!target) {
			throw new Meteor.Error('Пользователя с таким именем не существует');
		}

		if (room.users.indexOf( target._id ) != -1) {
			throw new Meteor.Error('Пользователь уже в чате');
		}

		room.users.push( target._id );
		room.logins.push( target.login );

		Game.ChatRoom.Collection.update({
			name: roomName
		}, {
			$set: {
				users: room.users,
				logins: room.logins
			}
		});

		Game.Chat.Collection.insert({
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

		var room = Game.ChatRoom.Collection.findOne({
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

		var i = room.users.indexOf( target._id );
		var j = room.logins.indexOf( target.login );
		if (i == -1 || j == -1) {
			throw new Meteor.Error('Такого пользователя нет в чате');
		}

		room.users.splice(i, 1);
		room.logins.splice(j, 1);

		Game.ChatRoom.Collection.update({
			name: roomName
		}, {
			$set: {
				users: room.users,
				logins: room.logins
			}
		});

		Game.Chat.Collection.insert({
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
	}
});

Meteor.publish('chatRoom', function(roomName) {
	if (this.userId) {
		check(roomName, String);
		return Game.ChatRoom.Collection.find({
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

Meteor.publish('chat', function (roomName, limit) {
	if (this.userId) {
		check(roomName, String);
		check(limit, Match.Integer);

		if (limit > Game.Chat.MESSAGE_LIMIT) {
			limit = Game.Chat.MESSAGE_LIMIT;
		}

		var room = Game.ChatRoom.Collection.findOne({
			name: roomName
		});

		if (room && (room.isPublic || room.users.indexOf(this.userId) != -1)) {
			return Game.Chat.Collection.find({
				room: roomName
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
				limit: limit
			});
		}
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