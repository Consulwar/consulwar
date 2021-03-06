import sanitizeHtml from 'sanitize-html';
import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';
import mutualSpaceCollection from '/imports/modules/MutualSpace/lib/collection';
import systemUser from '/moduls/user/server/systemUser';

import makeFun from '/imports/modules/Space/server/makeFun';
import systemUsername from '/moduls/user/lib/systemUsername';
import Game from '/moduls/game/lib/main.game';

initChatServer = function() {
'use strict';

initChatLib();

Game.Chat.Messages.Collection._ensureIndex({
  room_id: 1,
  sid: -1,
}, {
  unique: true,
});

Game.Chat.Messages.Collection._ensureIndex({
  username: 1,
  sid: -1,
});

Game.Chat.Room.Collection._ensureIndex({
  name: 1
});

Game.Chat.Messages.Collection.insertWithSid = function (doc, callback) {
  const targetCollection = Game.Chat.Messages.Collection;
  while (1) {
    var cursor = targetCollection.find(
      { room_id: doc.room_id },
      {
        fields: {
          sid: 1,
        },
        sort: {
          sid: -1,
        },
        limit: 1,
      },
    );
    var seq = cursor.count() > 0 && !isNaN(Number(cursor.fetch()[0].sid)) ? Number(cursor.fetch()[0].sid) + 1 : 1;
    doc.sid = seq;
    let result;
    try {
      targetCollection.insert(doc);
    } catch (ex) {
      result = ex;
    }
    if(result) {
      if(result.code === 11000 /* dup key */ ) {
        continue;
      } else {
        Log.add({ info: 'unexpected error inserting data', name: result });
        throw new Meteor.Error('Не получилось сохранить сообщение');
      }
    }
    break;
  }
}

Game.Chat.BalanceHistory = {
  Collection: new Meteor.Collection('chatBalanceHistory')
};

Game.Chat.BalanceHistory.Collection._ensureIndex({
  room_id: 1,
  timestamp: -1
});

// create defaul rooms on server startup
var createDefaulRoom = function(name, title, isFree) {
  if (!Game.Chat.Room.Collection.findOne({ name: name })) {
    Game.Chat.Room.Collection.insert({
      name: name,
      title: title,
      isPublic: true,
      isOfficial: true,
      isFree: isFree
    });
  }
};

createDefaulRoom('general', 'Основной', false);
createDefaulRoom('help', 'Помощь', true);

Game.Chat.createRoom = function(user, name, title, isPublic, isOwnerPays, initialBalance = 0) {
  let room = {
    name: name,
    title: title,
    owner: user._id,
    users: [user._id],
    usernames: [user.username],
    isPublic,
    isOwnerPays
  };

  if (isOwnerPays) {
    room.credits = initialBalance;
  }

  Game.Chat.Room.Collection.insert(room);
};

Game.Chat.Room.addParticipant = function(roomName, user) {
  Game.Chat.Room.Collection.update({
    name: roomName,
    deleted: { $ne: true }
  }, {
    $addToSet: {
      users: user._id,
      usernames: user.username
    }
  });
};

Game.Chat.Room.removeParticipant = function(roomName, user) {
  Game.Chat.Room.Collection.update({
    name: roomName,
    deleted: { $ne: true }
  }, {
    $pull: {
      users: user._id,
      usernames: user.username,
      moderators: user.username
    }
  });
};

var removeAllMessages = function(username) {
  var target = Meteor.users.findOne({
    username
  });

  Game.Chat.Messages.Collection.update({
    user_id: target._id
  }, {
    $set: {
      deleted: true
    }
  }, {
    multi: true
  });
};

var checkHasGlobalBan = function(userId) {
  var blockGlobal = Game.BanHistory.Collection.findOne({
    user_id: userId,
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
};

var checkHasRoomBan = function(userId, roomId, roomName) {
  var blockRoom = Game.BanHistory.Collection.findOne({
    user_id: userId,
    type: Game.BanHistory.type.chat,
    room_id: roomId
  }, {
    sort: {
      timestamp: -1
    }
  });

  if (blockRoom && Game.getCurrentTime() < blockRoom.timestamp + blockRoom.period) {
    throw new Meteor.Error('Чат ' + roomName + ' заблокирован', blockRoom.timestamp + blockRoom.period);
  }
};

var getAccessLevel = function(user, room) {
  if (user) {
    if (user.role == 'admin') {
      return 4;
    }
    if (user.role == 'helper') {
      return 3;
    }

    if (room) {
      if (room.owner && room.owner == user._id) {
        return 2;
      }
      if (room.moderators && room.moderators.indexOf(user.username) != -1) {
        return 1;
      }
    }
  }

  return 0;
};

const sanitizeHtmlGraceful = function(message) {
  const options = {
    allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'sub', 'sup', 's', 'strike', 'spoiler' ],
    allowedAttributes: {
      'a': [ 'href' ]
    }
  };
  const regEx = new RegExp(`<(?!/?(?:${options.allowedTags.join('|')}))`, 'g'); // escape '<' of disallowed tags as entity
  message = message.replace(regEx, '&lt;');
  return sanitizeHtml(message, options);
}


Meteor.methods({
  'chat.sendMessage': function(message, roomName) {
    const user = User.getById();
    User.checkAuth({ user });

    checkHasGlobalBan(user._id);

    Log.method.call(this, { name: 'chat.sendMessage', user });

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
    
    checkHasRoomBan(user._id, room._id, room.name);

    // check message
    check(message, String);

    message = sanitizeHtmlGraceful(message.trim().substr(0, 175)).trim();

    if (message.length === 0) {
      throw new Meteor.Error('Напиши хоть что-нибудь, чтобы отправить сообщение!');
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

    if (price
     && (price.crystals || price.credits)
     && room.minRating
     && (!user.rating || user.rating < room.minRating)
    ) {
      throw new Meteor.Error('Ваш рейтинг слишком мал, подрастите.');
    }

    const isDratutiChat = Game.Settings.getOption({
      name: 'chatDratuti',
      user
    });

    if (isDratutiChat) {
      const haveMessageDuringLastHour = Game.Chat.Messages.Collection.findOne({
        username: user.username,
        timestamp: {
          $gt: Game.getCurrentTime() - 60 * 60,
        }
      });

      if (haveMessageDuringLastHour) {
        throw new Meteor.Error('Вы уже дратути недавно');
      }
      
      message = '<h1><span style="color:#FF0018">Д</span><span style="color:#FFA52C">р</span><span style="color:#FFFF41">а</span><span style="color:#008018">т</span><span style="color:#0000F9">ут</span><span style="color:#86007D">и</span></h1>';
    }

    // send message
    var set = {
      room_id: room._id,
      user_id: user._id,
      username: user.username,
      alliance: user.alliance,
      rating: user.rating,
      message: message,
      timestamp: Game.getCurrentTime()
    };

    if (user.role) {
      set.role = user.role;
    }

    if (user.chatTitle) {
      set.chatTitle = user.chatTitle;
    }

    if (user.settings && user.settings.chat && user.settings.chat.icon) {
      set.iconPath = user.settings.chat.icon;
    }

    var stats = {};
    stats['chat.messages'] = 1;

    var userPayAnyway = false;

    if (message.substr(0, 1) == '/') {
      var reg = new RegExp(/^\/d (\d+ )?(\d+)(\s?(?:\+|-)?\d+)?$/);
      if (message == '/d' || reg.test(message)) {
        var dices = 1;
        var edges = 6;
        var modifier = 0;
        var roomModifier = room.diceModifier || 0;

        if (message != '/d') {
          var dice = reg.exec(message);
          dices = (dice[1] === undefined
            ? 1
            : (parseInt(dice[1]) || 1)
          );
          edges = parseInt(dice[2]);
          modifier = (dice[3] === undefined
            ? 0
            : parseInt(dice[3])
          );

          if (dices < 1 || dices > 9) {
            throw new Meteor.Error('Вы можете бросить от 1 до 9 костей');
          }
          if (edges < 2 || edges > 100) {
            throw new Meteor.Error('Вы можете бросить кости с кол-вом граней от 2 до 100');
          }
          if (Math.abs(modifier) >= 100) {
            throw new Meteor.Error('Модификатор должен находиться в диапазоне от -100 до 100');
          }
        }

        set.data = {
          type: 'dice',
          dice: {
            dices: {
              amount: dices,
              values: _.map(_.range(dices), function() {
                return Game.Random.interval(1, edges) + modifier + roomModifier;
              })
            },
            edges: edges
          }
        };
        if (modifier) {
          set.data.dice.modifier = modifier;
        }
        if (roomModifier) {
          set.data.dice.roomModifier = roomModifier;
        }
        stats['chat.dice'] = 1;

      } else if (message.indexOf('/med') === 0) {
        var meDiceReg = new RegExp(/^\/med ([^%]*)%(.+%.+)+%([^%]*)$/);
        var meDice = meDiceReg.exec(message);

        if (!meDice || !meDice[2]) {
          throw new Meteor.Error('Введите %несколько%вариантов% развития событий');
        }

        var variables = meDice[2].split("%");

        set.data = {
          type: 'medice',
          medice: {
            preText: meDice[1] || '',
            afterText: meDice[3] || '',
            variables: variables,
            selected: Game.Random.interval(0, variables.length-1)
          }
        };
        stats['chat.medice'] = 1;

      } else if (message.indexOf('/me') === 0) {
        set.data = {
          type: 'status'
        };
        set.message = message.substr(3);
        stats['chat.status'] = 1;

      } else if (message.indexOf('/coub') === 0) {
        price = {credits: 50};
        userPayAnyway = true;
        if (userResources.credits.amount < price.credits) {
          throw new Meteor.Error('У Вас недостаточно ресурсов');
        }
        const match = (
          message.match(new RegExp("coub\\.com/(?:view|embed)/([a-z0-9]{3,10})", 'i')) ||
          message.substr(6).match(new RegExp("^([a-z0-9]{3,10})$", 'i'))
        );
        if (match) {
          set.data = {
            type: 'coub',
            id: match[1]
          };
        } else {
          throw new Meteor.Error('Ошибка распознавания ID coub');
        }
        
        stats['chat.coub'] = 1;

        Game.Payment.Expense.log(price.credits, 'coub');
      } else if (message.indexOf('/motd') === 0) {
        if (['admin', 'helper'].indexOf(user.role) == -1
         && room.owner != user._id
         && (!room.moderators || room.moderators.indexOf(user.username) == -1)
        ) {
          throw new Meteor.Error('Вы не можете устанавливать сообщение дня в этот чат');
        }

        set.message = message.substr(5).trim();
        stats['chat.motd'] = 1;

      } else if (message.indexOf('/сэппуку') === 0) {
        if (userResources.crystals.amount < 0
         || userResources.metals.amount < 0
         || userResources.honor.amount < 0
         || userResources.credits.amount < 0
        ) {
          throw new Meteor.Error('Вы слишком бедны, чтобы совершать сэппуку');
        }

        set.data = {
          type: 'sepukku'
        };
        set.message = message.substr(8);
        stats['chat.sepukku'] = 1;

        var income = Game.Resources.getIncome();

        var doSepukku = function(uid, metals, crystals) {
          Game.Resources.spend({
            metals: {amount: metals},
            crystals: {amount: crystals},
            honor: 100,
            credits: 5
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

        Game.Payment.Expense.log(50, 'sepukku');
      } else if (message.indexOf('/яготовкрейду') === 0) {
        if (['admin', 'helper'].indexOf(user.role) == -1) {
          throw new Meteor.Error('Рейды доступны только хелперам и админам');
        }
        if (makeFun({ raid: true })) {
          set.data = {
            type: 'notprepared'
          };
          set.message = ' думает, что готов. Наивный.';
          stats['chat.notprepared'] = 1;
          Game.Broadcast.add(user.username, 'Вторжение началось!');
        } else {
          throw new Meteor.Error('Ты не готов!');
        }
      } else if (message.indexOf('/яготов') === 0) {
        throw new Meteor.Error('Ты не готов!');
        if (makeFun()) {
          set.data = {
            type: 'notprepared'
          };
          set.message = ' думает, что готов. Наивный.';
          stats['chat.notprepared'] = 1;
          Game.Broadcast.add(user.username, 'Думал что он готов. Хах.');
        }
      } else if (message.indexOf('/ilovereptiles') === 0) {
        if (Game.Cards.activate(Game.Cards.items.penalty.penaltyHumans, user)) {
          var humans = Math.floor( userResources.humans.amount * 0.05 );
          if (humans > 0) {
            Game.Resources.spend({ humans: humans });
          }

          set.data = {
            type: 'lovereptiles'
          };
          set.message = ' признался, что поддерживает Рептилоидов. Совет Галактики в шоке.';

          stats['chat.lovereptiles'] = 1;

          Game.Broadcast.add(user.username, 'признался, что поддерживает Рептилоидов. Совет Галактики в шоке.');
        } else {
          throw new Meteor.Error('Совет Галактики всё ещё в шоке!');
        }
      } else if (message.indexOf('/broadcast') === 0) {
        price = {credits: 1000};
        userPayAnyway = true;
        if ( userResources.credits.amount < price.credits ) {
          throw new Meteor.Error(`Бродкаст стоит ${price.credits}ггк. У вас их нет`);
        }
        Game.Broadcast.add(user.username, message.substr(10).trim());
        Game.Payment.Expense.log(price.credits, 'broadcast');
      } else if (message.indexOf('/krampus') === 0) {
        const targetUsername = message.substr(8).trim();
        const target = User.getByUsername({ username: targetUsername });
        if (!target || target.username === systemUser.username) {
          throw new Meteor.Error('Некорректная цель для бафа');
        }
        const level = Game.Cards.useKrampusBuff(user, target);

        set.data = {
          type: 'krampus',
          level,
        };

        if (targetUsername === user.username) {
          set.message = ` знатно подрочил. Теперь всё плохо.`;
        } else {
          set.message = ` поливает консула @${target.username} крампус-бафом`;
        }
      } else if (message.indexOf('/setenemy') === 0) {
        const enemyUsername = message.substr(9).trim();
        if (enemyUsername === systemUsername) {
          throw new Meteor.Error('Вы будете отключены от канала связи.');
        }
        if (enemyUsername === user.username) {
          throw new Meteor.Error('Вы не очень умны, да?');
        }
        if (user.enemy && user.enemy.expire > Game.getCurrentServerTime()) {
          throw new Meteor.Error('У вас уже есть враг');
        }

        const userLevel = Game.User.getLevel(user.rating);
        if (userLevel < 2) {
          throw new Meteor.Error('Вы слишком маленькие');
        }
        const enemy = User.getByUsername({ username: enemyUsername });
        if (!enemy) {
          throw new Meteor.Error('Нет такого пользователя');
        }
        const enemyLevel = Game.User.getLevel(enemy.rating);
        if (userLevel > enemyLevel) {
          throw new Meteor.Error('Маленьких бить нельзя');
        }
        if (!mutualSpaceCollection.findOne({
          username: enemyUsername,
        })) {
          throw new Meteor.Error('Враг должен быть в общем космосе');
        }

        Meteor.users.update({
          _id: user._id
        }, {
          $set: {
            enemy: {
              username: enemyUsername,
              expire: Game.getCurrentServerTime() + Meteor.settings.space.enemySpawner.duration,
            },
          },
        })

        set.data = {
          type: 'setenemy'
        };
        set.message = `объявил @${enemyUsername} своим врагом`;
        Game.Broadcast.add(user.username, set.message);
      } else {
        throw new Meteor.Error('Неправильная команда, введите /help для помощи');
      }
    }

    // message price
    if (price) {
      if (!userPayAnyway && room.isOwnerPays) {
        Game.Chat.Room.Collection.update({
          _id: room._id
        }, {
          $inc: { credits: price.credits * -1 }
        });
      } else {
        Game.Resources.spend(price);
        for (var key in price) {
          stats['chat.spent.' + key] = parseInt( price[key] );
        }
      }
    }

    // insert message
    if (message.indexOf('/broadcast') === 0) {
      // Do not send message
    } else if (message.indexOf('/motd') === 0) {
      Game.Chat.Room.Collection.update({
        _id: room._id
      }, {
        $set: {
          motd: (set.message.length > 0 ? set : null)
        }
      });
    } else {
      Game.Chat.Messages.Collection.insertWithSid(set);
    }

    // save statistic
    Game.Statistic.incrementUser(user._id, stats);
  },

  'chat.blockUser': function(options) {
    const user = User.getById();
    User.checkAuth({ user });

    checkHasGlobalBan(user._id);

    Log.method.call(this, { name: 'chat.blockUser', user });

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

      checkHasRoomBan(user._id, room._id, room.name);

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

    if (getAccessLevel(user, room) <= getAccessLevel(target, room)) {
      throw new Meteor.Error('Вы бессильны перед великим ' + target.username);
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

    if (options.reason) {
      check(options.reason, String);
      if (options.reason.length > 0) {
        history.reason = options.reason;
      }
    }

    Game.BanHistory.Collection.insert(history);

    // send message
    var message = null;

    if (options.roomName) {
      message = {
        room_id: room._id,
        user_id: user._id,
        username: user.username,
        alliance: user.alliance,
        rating: user.rating,
        data: {
          type: time <= 0 ? 'unblock' : 'block',
          reason: history.reason,
          timestamp: Game.getCurrentTime(),
          period: time
        },
        message: target.username,
        timestamp: Game.getCurrentTime()
      };

      if (user.role) {
        message.role = user.role;
      }

      if (user.settings && user.settings.chat && user.settings.chat.icon) {
        message.iconPath = user.settings.chat.icon;
      }

      Game.Chat.Messages.Collection.insertWithSid(message);
    } else {
      // silient block with hide messages
      // one million and one second is secret code :-)
      console.log(time);
      if (time == 60000060) {
        removeAllMessages(options.username);
        return;
      }


      var rooms = Game.Chat.Room.Collection.find({
        deleted: { $ne: true },
        $or: [
          { users: { $in: [ target._id ] } },
          { isPublic: true }
        ]
      }).fetch();

      for (var i = 0; i < rooms.length; i++) {
        message = {
          room_id: rooms[i]._id,
          user_id: user._id,
          username: user.username,
          alliance: user.alliance,
          data: {
            type: time <= 0 ? 'unblock' : 'block',
            reason: history.reason,
            timestamp: Game.getCurrentTime(),
            period: time,
            global: true
          },
          message: target.username,
          timestamp: Game.getCurrentTime()
        };

        if (user.role) {
          message.role = user.role;
        }

        if (user.settings && user.settings.chat && user.settings.chat.icon) {
          message.iconPath = user.settings.chat.icon;
        }

        Game.Chat.Messages.Collection.insertWithSid(message);
      }
    }
  },

  'chat.banAccount': function(username) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'chat.banAccount', user });

    if (['admin'].indexOf(user.role) == -1) {
      throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
    }

    var target = Meteor.users.findOne({
      username: username
    });

    if (!target) {
      throw new Meteor.Error('Некорректно указан логин');
    }

    removeAllMessages(username);

    Meteor.users.update({_id: target._id}, {
      $set: {
        blocked: true
      }
    });
  },

  'chat.createRoom': function(title, url, isPublic, isOwnerPays) {
    const user = User.getById();
    User.checkAuth({ user });

    checkHasGlobalBan(user._id);

    Log.method.call(this, { name: 'chat.createRoom', user });

    // check room name
    check(title, String);
    check(url, String);

    if (title.length > 32) {
      throw new Meteor.Error('Имя комнаты должно быть не длиннее 32 символов');
    }

    if (url.length > 32) {
      throw new Meteor.Error('URL комнаты должен быть не длиннее 32 символов');
    }

    if (!url.match(/^[a-zA-Z0-9_\-]+$/)) {
      throw new Meteor.Error('URL комнаты может содержать только латинские буквы, цифры, дефисы и подчеркивания');
    }

    var room = Game.Chat.Room.Collection.findOne({
      $or: [
        {name: url},
        {title: title}
      ],
      deleted: { $ne: true }
    });

    if (room) {
      throw new Meteor.Error('Комната с ' + (
        room.title == title
          ? 'именем ' + title
          : 'URL ' + url
      ) + ' уже существует');
    }

    // prepare room
    room = {
      name: url,
      title: title,
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

    // save statistic
    Game.Statistic.incrementUser(user._id, {
      'chat.rooms.created': 1
    });
  },

  'chat.removeRoom': function(name) {
    const user = User.getById();
    User.checkAuth({ user });

    checkHasGlobalBan(user._id);

    Log.method.call(this, { name: 'chat.removeRoom', user });

    check(name, String);

    if (['general', 'help'].indexOf(name) != -1) {
      throw new Meteor.Error('Что этот ниггер себе позволяет!');
    }

    var room = Game.Chat.Room.Collection.findOne({
      name: name,
      deleted: { $ne: true }
    });

    if (!room) {
      throw new Meteor.Error('Комната с именем ' + name + ' не существует');
    }

    if (user.role != 'admin' && room.owner != user._id) {
      throw new Meteor.Error('Вы не можете удалить эту комнату');
    }

    Game.Chat.Room.Collection.update({
      _id: room._id
    }, {
      $set: { deleted: true }
    });

    // save statistic
    Game.Statistic.incrementUser(user._id, {
      'chat.rooms.deleted': 1
    });
  },

  'chat.buyFreeChat': function() {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'chat.buyFreeChat', user });

    var resources = Game.Resources.getValue();

    if (resources.credits.amount < Game.Chat.Messages.FREE_CHAT_PRICE) {
      throw new Meteor.Error('Недостаточно средств');
    }

    Game.Resources.spend({ credits: Game.Chat.Messages.FREE_CHAT_PRICE });

    Game.Payment.Expense.log(Game.Chat.Messages.FREE_CHAT_PRICE, 'chatFree');

    Meteor.users.update({
      _id: user._id
    }, {
      $set: { isChatFree: true }
    });
  },

  'chat.addCreditsToRoom': function(roomName, credits) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'chat.addCreditsToRoom', user });

    check(credits, Match.Integer);

    if (credits < 100) {
      throw new Meteor.Error('Минимальная сумма составляет 100 Грязных Галактических Кредитов');
    }

    check(roomName, String);

    var room = Game.Chat.Room.Collection.findOne({
      name: roomName,
      deleted: { $ne: true }
    });

    if (!room) {
      throw new Meteor.Error('Комнаты с именем ' + roomName + ' не существует');
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

    Game.Payment.Expense.log(credits, 'chatBalance', {
      roomId: room._id
    });

    Game.Chat.BalanceHistory.Collection.insert({
      room_id: room._id,
      credits: credits,
      timestamp: Game.getCurrentTime(),
      user_id: user._id,
      username: user.username
    });

    var message = {
      room_id: room._id,
      user_id: user._id,
      username: user.username,
      alliance: user.alliance,
      rating: user.rating,
      data: {
        type: 'addfunds',
        amount: credits
      },
      timestamp: Game.getCurrentTime()
    };

    if (user.role) {
      message.role = user.role;
    }

    if (user.settings && user.settings.chat && user.settings.chat.icon) {
      message.iconPath = user.settings.chat.icon;
    }

    Game.Chat.Messages.Collection.insertWithSid(message);

    // save statistic
    var stats = {};
    stats['chat.spent.credits'] = credits;
    Game.Statistic.incrementUser(user._id, stats);
  },

  'chat.changeDiceModifierForRoom': function(roomName, modifier) {
    const user = User.getById();
    User.checkAuth({ user });

    checkHasGlobalBan(user._id);

    Log.method.call(this, { name: 'chat.changeDiceModifierForRoom', user });

    check(roomName, String);
    check(modifier, Match.Integer);

    if (Math.abs(modifier) >= 100) {
      throw new Meteor.Error('Модификатор должен находиться в диапазоне от -100 до 100');
    }

    var room = Game.Chat.Room.Collection.findOne({
      name: roomName,
      deleted: { $ne: true }
    });

    if (!room) {
      throw new Meteor.Error('Комната с именем ' + roomName + ' не существует');
    }

    checkHasRoomBan(user._id, room._id, room.name);

    if (user.role != 'admin'
     && room.owner != user._id
     && (!room.moderators || room.moderators.indexOf(user.username) == -1)
    ) {
      throw new Meteor.Error('Вы не можете изменять модификатор в этой комнате');
    }

    Game.Chat.Room.Collection.update({
      _id: room._id
    }, {
      $set: {
        diceModifier: modifier
      }
    });

    var message = {
      room_id: room._id,
      user_id: user._id,
      username: user.username,
      alliance: user.alliance,
      rating: user.rating,
      data: {
        type: 'changeDiceModifier',
        modifier: modifier
      },
      timestamp: Game.getCurrentTime()
    };

    if (user.role) {
      message.role = user.role;
    }

    if (user.settings && user.settings.chat && user.settings.chat.icon) {
      message.iconPath = user.settings.chat.icon;
    }

    Game.Chat.Messages.Collection.insertWithSid(message);
  },

  'chat.changeMinRating': function(roomName, minRating) {
    const user = User.getById();
    User.checkAuth({ user });

    checkHasGlobalBan(user._id);

    Log.method.call(this, { name: 'chat.changeMinRating', user });

    check(roomName, String);
    check(minRating, Match.Integer);

    if (minRating < 0) {
      throw new Meteor.Error('Рейтинг не может быть меньше 0');
    }

    var room = Game.Chat.Room.Collection.findOne({
      name: roomName,
      deleted: { $ne: true }
    });

    if (!room) {
      throw new Meteor.Error('Комната с именем ' + roomName + ' не существует');
    }

    checkHasRoomBan(user._id, room._id, room.name);

    if (user.role != 'admin'
     && room.owner != user._id
     && (!room.moderators || room.moderators.indexOf(user.username) == -1)
    ) {
      throw new Meteor.Error('Вы не можете изменять минимальный рейтинг в этой комнате');
    }

    Game.Chat.Room.Collection.update({
      _id: room._id
    }, {
      $set: {
        minRating: minRating
      }
    });

    var message = {
      room_id: room._id,
      user_id: user._id,
      username: user.username,
      alliance: user.alliance,
      rating: user.rating,
      data: {
        type: 'changeMinRating',
        minRating: minRating
      },
      timestamp: Game.getCurrentTime()
    };

    if (user.role) {
      message.role = user.role;
    }

    if (user.settings && user.settings.chat && user.settings.chat.icon) {
      message.iconPath = user.settings.chat.icon;
    }

    Game.Chat.Messages.Collection.insertWithSid(message);
  },

  'chat.addModeratorToRoom': function(roomName, username) {
    const user = User.getById();
    User.checkAuth({ user });

    checkHasGlobalBan(user._id);

    Log.method.call(this, { name: 'chat.addModeratorToRoom', user });

    check(roomName, String);
    check(username, String);

    var room = Game.Chat.Room.Collection.findOne({
      name: roomName,
      deleted: { $ne: true }
    });

    if (!room) {
      throw new Meteor.Error('Комнаты с именем ' + roomName + ' не существует');
    }

    checkHasRoomBan(user._id, room._id, room.name);

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

    var message = {
      room_id: room._id,
      user_id: user._id,
      username: user.username,
      alliance: user.alliance,
      rating: user.rating,
      data: {
        type: 'addModerator'
      },
      message: target.username,
      timestamp: Game.getCurrentTime()
    };

    if (user.role) {
      message.role = user.role;
    }

    if (user.settings && user.settings.chat && user.settings.chat.icon) {
      message.iconPath = user.settings.chat.icon;
    }

    Game.Chat.Messages.Collection.insertWithSid(message);
  },

  'chat.removeModeratorFromRoom': function(roomName, username) {
    const user = User.getById();
    User.checkAuth({ user });

    checkHasGlobalBan(user._id);

    Log.method.call(this, { name: 'chat.removeModeratorFromRoom', user });

    check(roomName, String);
    check(username, String);

    var room = Game.Chat.Room.Collection.findOne({
      name: roomName,
      deleted: { $ne: true }
    });

    if (!room) {
      throw new Meteor.Error('Комнаты с именем ' + roomName + ' не существует');
    }

    checkHasRoomBan(user._id, room._id, room.name);

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

    var message = {
      room_id: room._id,
      user_id: user._id,
      username: user.username,
      alliance: user.alliance,
      rating: user.rating,
      data: {
        type: 'removeModerator'
      },
      message: username,
      timestamp: Game.getCurrentTime()
    };

    if (user.role) {
      message.role = user.role;
    }

    if (user.settings && user.settings.chat && user.settings.chat.icon) {
      message.iconPath = user.settings.chat.icon;
    }

    Game.Chat.Messages.Collection.insertWithSid(message);
  },

  'chat.addUserToRoom': function(roomName, username) {
    const user = User.getById();
    User.checkAuth({ user });

    checkHasGlobalBan(user._id);

    Log.method.call(this, { name: 'chat.addUserToRoom', user });

    check(roomName, String);
    check(username, String);

    var room = Game.Chat.Room.Collection.findOne({
      name: roomName,
      deleted: { $ne: true }
    });

    if (!room) {
      throw new Meteor.Error('Комнаты с именем ' + roomName + ' не существует');
    }

    if (room.isPublic) {
      throw new Meteor.Error('Невозможно добавить пользователя');
    }

    checkHasRoomBan(user._id, room._id, room.name);

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

    var message = {
      room_id: room._id,
      user_id: user._id,
      username: user.username,
      alliance: user.alliance,
      rating: user.rating,
      data: {
        type: 'add'
      },
      message: target.username,
      timestamp: Game.getCurrentTime()
    };

    if (user.role) {
      message.role = user.role;
    }

    if (user.settings && user.settings.chat && user.settings.chat.icon) {
      message.iconPath = user.settings.chat.icon;
    }

    Game.Chat.Messages.Collection.insertWithSid(message);
  },

  'chat.removeUserFromRoom': function(roomName, username) {
    const user = User.getById();
    User.checkAuth({ user });

    checkHasGlobalBan(user._id);

    Log.method.call(this, { name: 'chat.removeUserFromRoom', user });

    check(roomName, String);
    check(username, String);

    var room = Game.Chat.Room.Collection.findOne({
      name: roomName,
      deleted: { $ne: true }
    });

    if (!room) {
      throw new Meteor.Error('Комнаты с именем ' + roomName + ' не существует');
    }

    if (room.isPublic) {
      throw new Meteor.Error('Невозможно удалить пользователя');
    }

    checkHasRoomBan(user._id, room._id, room.name);

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

    var message = {
      room_id: room._id,
      user_id: user._id,
      username: user.username,
      alliance: user.alliance,
      rating: user.rating,
      data: {
        type: 'remove'
      },
      message: target.username,
      timestamp: Game.getCurrentTime()
    };

    if (user.role) {
      message.role = user.role;
    }

    if (user.settings && user.settings.chat && user.settings.chat.icon) {
      message.iconPath = user.settings.chat.icon;
    }

    Game.Chat.Messages.Collection.insertWithSid(message);
  },

  'chat.loadMore': function(options) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'chat.loadMore', user });

    check(options, Object);
    check(options.roomName, String);
    check(options.sid, Match.Integer);

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

    return Game.Chat.Messages.Collection.find({
      room_id: room._id,
      sid: { $lt: options.sid },
      deleted: { $ne: true }
    }, {
      fields: {
        _id: 1,
        user_id: 1,
        username: 1,
        message: 1,
        data: 1,
        timestamp: 1,
        sid: 1,
        alliance: 1,
        type: 1,
        role: 1,
        cheater: 1,
        room: 1,
        iconPath: 1,
        rating: 1,
        chatTitle: 1,
      },
      sort: {
        sid: -1,
      },
      limit: Game.Chat.Messages.LOAD_COUNT
    }).fetch();
  },

  'chat.getRoomsList': function() {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'chat.getRoomsList', user });

    return Game.Chat.Room.Collection.find({
      isOfficial: { $ne: true },
      deleted: { $ne: true },
      $or: [
        { users: { $in: [ user._id ] } },
        { isPublic: true }
      ]
    }).fetch();
  },

  'chat.setupRoomsVisibility': function(rooms) {
    const user = User.getById();
    User.checkAuth({ user });

    check(rooms, Object);

    var visible = [];
    var hidden = [];

    for (var key in rooms) {
      if (_.isString(key) && key.length <= 32) {
        if (rooms[key]) {
          visible.push(key);
        } else {
          hidden.push(key);
        }
      }
    }
      
    var update = null;

    if (visible.length > 0) {
      update = { $pull: {} };
      update.$pull['settings.chat.hiddenRooms'] = { $in: visible };
      Meteor.users.update({ _id: user._id }, update);
    }

    if (hidden.length > 0) {
      update = { $addToSet: {} };
      update.$addToSet['settings.chat.hiddenRooms'] = { $each: hidden };
      Meteor.users.update({ _id: user._id }, update);
    }
  },

  'chat.getBalanceHistory': function(roomName, page, count) {
    const user = User.getById();
    User.checkAuth({ user });

    check(roomName, String);

    var room = Game.Chat.Room.Collection.findOne({
      name: roomName,
      deleted: { $ne: true },
      $or: [
        { users: { $in: [ user._id ] } },
        { isPublic: true }
      ]
    });

    if (!room) {
      throw new Meteor.Error('Нет такой комнаты');
    }

    check(page, Match.Integer);
    check(count, Match.Integer);

    if (count > 100) {
      throw new Meteor.Error('Много будешь знать – скоро состаришься');
    }

    var result = Game.Chat.BalanceHistory.Collection.find({
      room_id: room._id
    }, {
      sort: {timestamp: -1},
      skip: (page > 0) ? (page - 1) * count : 0,
      limit: count
    });

    return {
      data: result.fetch(),
      count: result.count()
    };
  }
});

Meteor.publish('chatRoom', function(roomName) {
  if (this.userId) {
    check(roomName, String);

    var cursor = Game.Chat.Room.Collection.find({
      name: roomName,
      deleted: { $ne: true }
    });

    var room = (cursor) ? cursor.fetch()[0] : null;

    if (room && (room.isPublic || room.users.indexOf(this.userId) != -1)) {
      return cursor;
    } else {
      return null;
    }
  } else {
    this.ready();
  }
});

Meteor.publish('chat', function (roomName) {
  if (this.userId) {
    check(roomName, String);

    var room = Game.Chat.Room.Collection.findOne({
      name: roomName,
      deleted: { $ne: true }
    });

    if (room && (room.isPublic || room.users.indexOf(this.userId) != -1)) {
      return Game.Chat.Messages.Collection.find({
        room_id: room._id,
        deleted: { $ne: true }
      }, {
        fields: {
          _id: 1,
          user_id: 1,
          username: 1,
          message: 1,
          data: 1,
          timestamp: 1,
          sid: 1,
          alliance: 1,
          type: 1,
          role: 1,
          cheater: 1,
          room: 1,
          iconPath: 1,
          rating: 1,
          chatTitle: 1,
        },
        sort: {
          sid: -1,
        },
        limit: Game.Chat.Messages.LOAD_COUNT
      });
    } else {
      return null;
    }
  } else {
    this.ready();
  }
});

};