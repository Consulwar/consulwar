import User from '/imports/modules/User/server/User';

initItemsServer = function() {
'use strict';

initItemLib();

Game.Icons.Collection._ensureIndex({
  user_id: 1
});

Game.Icons.canUseIcon = function(group, engName) {
  var icon = Game.Icons.getIcon(group, engName);
  if (!icon) {
    throw new Meteor.Error('Нет такой иконки');
  }

  if (!icon.meetRequirements()) {
    throw new Meteor.Error('Вы не удовлетворяете требованиям иконки');
  }

  if (!icon.checkHas()) {
    throw new Meteor.Error('Иконку сначала нужно купить');
  }

  if (!icon.checkHas()) {
    throw new Meteor.Error('Иконку сначала нужно купить');
  }

  return true;
};

Meteor.methods({
  'icon.buy': function(group, engName) {
    const user = User.getById();
    User.checkAuth({ user });

    var icon = Game.Icons.getIcon(group, engName);
    if (!icon) {
      throw new Meteor.Error('Нет такой иконки');
    }

    if (!icon.meetRequirements()) {
      throw new Meteor.Error('Вы не удовлетворяете требованиям иконки');
    }

    if (!icon.canBuy()) {
      throw new Meteor.Error('Вы не можете купить эту иконку');
    }

    Game.Resources.spend(icon.price);

    if (icon.price.credits) {
      Game.Payment.Expense.log(icon.price.credits, 'chatIcon', {
        group: group,
        engName: engName
      });
    }
    
    var update = { $addToSet: {} };
    update.$addToSet[group] = engName;

    Game.Icons.Collection.upsert({ user_id: user._id }, update);

    if (icon.isUnique) {
      update = { $set: {} };
      update.$set[group + '.' + engName] = {
        user_id: user._id,
        username: user.username,
        timestamp: Game.getCurrentTime()
      };

      Game.Icons.Collection.upsert({ user_id: 'unique' }, update);
    }
  },





  'chat.selectIcon': function(group, engName) {
    const user = User.getById();
    User.checkAuth({ user });

    if (Game.Icons.canUseIcon(group, engName)) {
      Meteor.users.update({
        _id: user._id
      }, {
        $set: {
          'settings.chat.icon': group + '/' + engName
        }
      });
    }  
  },

  'chat.setUserIcon': function(username, iconPath) {
    const user = User.getById();
    User.checkAuth({ user });

    if (['admin'].indexOf(user.role) == -1) {
      throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
    }

    check(username, String);
    check(iconPath, String);

    Meteor.users.update({
      username: username
    }, {
      $set: {
        'settings.chat.icon': iconPath
      }
    });
  }
});

Meteor.publish('iconsUser', function() {
  if (this.userId) {
    return Game.Icons.Collection.find({
      user_id: this.userId
    });
  } else {
    this.ready();
  }
});

Meteor.publish('iconsUnique', function() {
  if (this.userId) {
    return Game.Icons.Collection.find({
      user_id: 'unique'
    });
  } else {
    this.ready();
  }
});


};