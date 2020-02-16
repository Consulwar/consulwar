import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';

initStatisticAchievementsServer = function() {
'use strict';

initStatisticAchievementsLib();

Meteor.methods({
  'achievements.complete': function(completed) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'achievements.complete', user });

    var statistic = Game.Statistic.getUser();
    var achievements = Game.Achievements.getValue();

    var result = null;
    var set = null;

    for (var group in completed) {
      for (var key in completed[group]) {
        if (!Game.Achievements.items[group][key]) {
          continue;
        }

        var currentLevel = Game.Achievements.items[group][key].currentLevel({ achievements });
        var progressLevel = Game.Achievements.items[group][key].progressLevel(statistic);

        if (completed[group][key] == progressLevel && progressLevel > currentLevel) {
          if (!set) {
            set = {};
            result = {};
          }
          if (!result[group]) {
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

  'achievements.give': function(username, achievementGroup, achievementId, level = 1) {
    const user = User.getById();
    User.checkAuth({ user });

    if (['admin'].indexOf(user.role) == -1) {
      throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
    }

    Log.method.call(this, { name: 'achievements.give', user });

    check(username, String);
    check(achievementId, String);
    check(achievementGroup, String);
    check(level, Match.Integer);

    const target = Meteor.users.findOne({
      username: username
    });
    if (!target) {
      throw new Meteor.Error('Некорректно указан логин');
    }

    const group = Game.Achievements.items[achievementGroup];
    if (!group) {
      throw new Meteor.Error('Такого достижения нет');
    }

    const achievement = group[achievementId];
    if (!achievement) {
      throw new Meteor.Error('Такого достижения нет');
    }

    Meteor.users.update({
      _id: target._id
    }, {
      $set: {
        [`achievements.${achievementGroup}.${achievementId}.timestamps.${level}`]: Game.getCurrentTime(),
        [`achievements.${achievementGroup}.${achievementId}.level`]: level,
      },
    });
  },

  'achievements.increase': function(username, achievementGroup, achievementId, levels = 1) {
    const user = User.getById();
    User.checkAuth({ user });

    if (['admin'].indexOf(user.role) == -1) {
      throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
    }

    Log.method.call(this, { name: 'achievements.increase', user });

    check(username, String);
    check(achievementId, String);
    check(achievementGroup, String);
    check(levels, Match.Integer);

    const target = Meteor.users.findOne({
      username: username
    });
    if (!target) {
      throw new Meteor.Error('Некорректно указан логин');
    }

    const group = Game.Achievements.items[achievementGroup];
    if (!group) {
      throw new Meteor.Error('Такого достижения нет');
    }

    const achievement = group[achievementId];
    if (!achievement) {
      throw new Meteor.Error('Такого достижения нет');
    }

    let currentLevel = 0;
    let currentLevelRaw = null;
    if (
      target.achievements
      && target.achievements[achievementGroup] != null
      && target.achievements[achievementGroup][achievementId] != null
    ) {
      currentLevelRaw = currentLevel = target.achievements[achievementGroup][achievementId].level;
    }
    if (currentLevel >= achievement.maxLevel()) {
      throw new Meteor.Error('Уже достигнут максимальный уровень');
    }
    if (currentLevel + levels > achievement.maxLevel()) {
      throw new Meteor.Error('Давать ачивку выше максимального уровня — так себе идея');
    }

    const updated = Meteor.users.update({
      _id: target._id,
      [`achievements.${achievementGroup}.${achievementId}.level`]: currentLevelRaw,
    }, {
      $set: {
        [`achievements.${achievementGroup}.${achievementId}.timestamps.${currentLevel + levels}`]: Game.getCurrentTime(),
      },
      $inc: {
        [`achievements.${achievementGroup}.${achievementId}.level`]: levels,
      }
    });

    if (!updated) {
      throw new Meteor.Error('Упс, кажется, кто-то выдал ачивку одновременно с вами');
    }
  },
});

};