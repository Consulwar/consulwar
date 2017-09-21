initStatisticAchievementsServer = function() {
'use strict';

initStatisticAchievementsLib();

Meteor.methods({
  'achievements.complete': function(completed) {
    var user = Meteor.user();

    if (!(user && user._id)) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован.');
    }

    Game.Log.method.call(this, 'achievements.complete');

    var statistic = Game.Statistic.getUser();
    var achievements = Game.Achievements.getValue();

    var result = null;
    var set = null;

    for (var group in completed) {
      for (var key in completed[group]) {
        if (!Game.Achievements.items[group][key]) {
          continue;
        }

        var currentLevel = Game.Achievements.items[group][key].currentLevel(achievements);
        var progressLevel = Game.Achievements.items[group][key].progressLevel(statistic);

        if (completed[group][key] == progressLevel && progressLevel > currentLevel) {
          if (!set) {
            set = {};
            result = {};
          }
          if (!set[group]) {
            set[group] = {};
            result[group] = {};
          }

          set['achievements.' + group + '.' + key + '.level'] = progressLevel;
          set['achievements.' + group + '.' + key + '.timestamps.' + progressLevel] = Game.getCurrentTime();

          result[group][key] = progressLevel;
        }
      }
    }

    if (set) {
      Meteor.users.update({
        _id: Meteor.userId()
      }, {
        $set: set
      });
    }

    return result;
  },

  'achievements.give': function(username, achievementGroup, achievementId, level) {
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

    Game.Log.method.call(this, 'achievements.give');

    check(username, String);
    check(achievementId, String);
    check(achievementGroup, String);

    if (level) {
      check(level, Match.Integer);
    } else {
      level = 1;
    }

    var target = Meteor.users.findOne({
      username: username
    });

    if (!target) {
      throw new Meteor.Error('Некорректно указан логин');
    }

    if (!Game.Achievements.items[achievementGroup][achievementId]) {
      throw new Meteor.Error('Такого достижения нет');
    }

    var set = {};
    set['achievements.' + achievementGroup + '.' + achievementId] = {
      level: level,
      timestamp: Game.getCurrentTime()
    };

    Meteor.users.update({
      _id: target._id
    }, {
      $set: set
    });
  }
});

};