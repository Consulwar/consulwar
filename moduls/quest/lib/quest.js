let content;
if (Meteor.isClient) {
  content = require('/imports/content/client').default;
} else {
  content = require('/imports/content/server').default;
}

initQuestLib = function() {
'use strict';

game.Quest = function(options, isNew = (Meteor.isClient ? false : true)) {
  if (isNew) {
    // New-to-legacy
    let [, , who, lineName, engName] = options.id.split('/');
    options.who = who.toLocaleLowerCase();
    options.engName = engName; // No need to lower case!
    options.conditionText = options.title;

    if (Game.newToLegacyNames[options.who]) {
      options.who = Game.newToLegacyNames[options.who];
    }

    options.isDone = function() {
      return _(options.condition).every((condition) => {
        if (_(condition).isFunction()) {
          return condition();
        }

        let idParts = condition[0].split('/');
        const type = idParts.shift();
        const item = idParts.join('/');
        switch(type) {
          case 'Quest':
            return Game.Quest.checkFinished(item);
          case 'Building':
          case 'Research':
            return content[condition[0]].has({ level: condition[1] });
          case 'Unit':
            return content[condition[0]].has({ count: condition[1] });
          case 'Statistic':
            return Game.Statistic.getUserValue(item) >= condition[1];
        }
        return false;
      });
    }
    //
  }
  this.engName = options.engName;
  this.conditions = options.conditions;
  this.conditionText = options.conditionText;
  this.text = options.text;
  this.reward = options.reward;
  this.options = options.options;
  this.isDone = options.isDone;
  this.slides = options.slides;
};

Game.Quest = {
  Collection: new Meteor.Collection('quest'),

  status: {
    PROMPT: 0,
    INPROGRESS: 1,
    CANCELED: 2,
    FINISHED: 3
  },

  getValue: function() {
    return Game.Quest.Collection.findOne({
      user_id: Meteor.userId()
    });
  },

  getOneById: function(id) {
    var quests = Game.Quest.getValue();
    return (quests && quests.current && quests.current[id])
      ? quests.current[id]
      : null;
  },

  getOneByHero: function(who) {
    var quests = Game.Quest.getValue();
    var result = null;

    if (quests && quests.current) {
      for (var key in quests.current) {
        if (quests.current[key].who == who) {
          if (!result || quests.current[key].status > result.status) {
            result = quests.current[key];
            break;
          }
        }
      }
    }

    return result;
  },

  getAllByHero: function(who) {
    var quests = Game.Quest.getValue();
    var result = null;

    if (quests && quests.current) {
      for (var key in quests.current) {
        if (quests.current[key].who == who) {
          if (!result) {
            result = {};
          }
          result[key] = quests.current[key];
        }
      }
    }

    return result;
  },

  hasNewDaily: function() {
    var quests = Game.Quest.getValue();
    if (quests
     && quests.daily
     && quests.daily.status != Game.Quest.status.FINISHED
    ) {
      return true;
    }
    return false;
  },

  getDaily: function() {
    var quests = Game.Quest.getValue();
    if (quests && quests.daily) {
      return quests.daily;
    }
    return null;
  },

  checkFinished: function(id) {
    var quests = Game.Quest.getValue();
    return (quests && quests.finished && quests.finished[id]) ? true : false;
  }
};

};