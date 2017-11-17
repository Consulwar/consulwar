import persons from '/imports/content/Person/client/';
import '/imports/client/ui/Person/image/PersonImage';

const engNameToPerson = {};
_(persons).values().forEach((person) => {
  engNameToPerson[person.engName] = person;
});

initQuestClient = function () {
'use strict';

initQuestLib();

Meteor.subscribe('quest');

var isLoading = new ReactiveVar(false);
var loadedQuest = new ReactiveVar(null);

Game.Quest.showDailyQuest = function() {
  isLoading.set(false);
  loadedQuest.set(null);

  var dailyQuest = Game.Quest.getDaily();

  if (dailyQuest.status == Game.Quest.status.INPROGRESS) {
    // show inprogress daily quest
    Game.Popup.show({
      templateName: 'quest',
      data: {
        who: dailyQuest.who || 'tamily',
        person: Game.Persons[dailyQuest.who || 'tamily'],
        type: 'daily',
        title: dailyQuest.name,
        isPrompt: true,
      },
    });

    // load full info
    isLoading.set(true);
    Meteor.call('quests.getDailyInfo', function(err, quest) {
      isLoading.set(false);
      loadedQuest.set(quest);
    });
  } else {
    // show finished daily quest
    Game.Popup.show({
      templateName: 'quest',
      data: {
        who: dailyQuest.who || 'tamily',
        person: Game.Persons[dailyQuest.who || 'tamily'],
        type: 'daily',
        title: dailyQuest.name, 
        text: dailyQuest.result,
      },
    });
  }
};

Game.Quest.showQuest = function(id) {
  var currentQuest = Game.Quest.getOneById(id);
  if (!currentQuest) {
    return; // no active quest with given id
  }

  if (currentQuest.status == Game.Quest.status.FINISHED) {
    // quest finished, render reward popup
    Game.Popup.show({
      templateName: 'reward',
      data: {
        type: 'quest',
        engName: currentQuest.engName,
        who: currentQuest.who,
        person: Game.Persons[currentQuest.who],
      },
    });
  } else {
    // quest not finished, render reqular quest window
    Game.Popup.show({
      templateName: 'quest',
      data: {
        type: 'quest',
        engName: currentQuest.engName,
        who: currentQuest.who,
        person: Game.Persons[currentQuest.who],
        title: currentQuest.name,
        isPrompt: currentQuest.status == Game.Quest.status.PROMPT,
      },
    });
  }

  // load full info
  isLoading.set(true);
  loadedQuest.set(null);

  Meteor.call('quests.getInfo', currentQuest.engName, currentQuest.step, function(err, data) {
    isLoading.set(false);
    loadedQuest.set( new game.Quest(data) );
  });
};

Game.Quest.showGreeteing = function(who) {
  isLoading.set(false);
  loadedQuest.set(null);

  // show character greeting text
  var text = Game.Persons[who].defaultText;
  if (text && text.length > 0) {
    Game.Popup.show({
      templateName: 'quest',
      data: {
        who,
        person: Game.Persons[who],
        type: 'quest',
        text,
      },
    });
  }
};

Template.quest.helpers({
  isLoading: function() { return isLoading.get(); },

  options: function() {
    if (isLoading.get()) {
      return null; // don't show options during loading
    }

    var quest = loadedQuest.get();
    if (!quest) {
      return null; // quest not loaded
    }

    // daily quest answers
    if (quest.answers) {
      return _.map(quest.answers, function(text, name) {
        return {
          name: name,
          text: text,
          mood: 'neutral'
        };
      });
    }

    // regular quest options
    if (quest.options) {
      return _.map(quest.options, function(values, name) {
        values.name = name;
        return values;
      });
    }

    return null;
  },

  text: function() {
    var quest = loadedQuest.get();
    return quest ? quest.text : this.text;
  },

  reward: function() {
    var quest = loadedQuest.get();
    return quest ? quest.reward : this.reward;
  },

  characterName: function(who) {
    return engNameToPerson[who] ? engNameToPerson[who].title : null;
  }
});

Template.quest.onRendered(function() {
  $(this.firstNode).perfectScrollbar();
});

Template.quest.events({
  'click a': function(e, t) {
    if (t.data.type == 'quest') {
      // send reqular quest action and close popup
      Meteor.call('quests.sendAction', t.data.engName, e.target.dataset.option);
      Blaze.remove(t.view);
    } else {
      // send daily quest answer and render result
      isLoading.set(true);
      Meteor.call('quests.sendDailyAnswer', e.target.dataset.option, function(err, result) {
        isLoading.set(false);
        loadedQuest.set(result);
      });
    }
  }
});

Template.reward.helpers({
  isLoading: function() { return isLoading.get(); },

  reward: function() {
    var quest = loadedQuest.get();
    return quest ? quest.reward : null;
  }
});

Template.reward.events({
  'click .take': function(e, t) {
    Meteor.call('quests.getReward', t.data.engName);
    Blaze.remove(t.view);
  }
});

};