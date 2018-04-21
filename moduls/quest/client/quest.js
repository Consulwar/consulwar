import content from '/imports/content/client';
import persons from '/imports/content/Person/client/';
import Gallery from '/imports/client/ui/blocks/Gallery/Gallery'
import RewardPopup from '/imports/client/ui/blocks/Reward/Popup/RewardPopup';
import Quest from '/imports/client/ui/blocks/Quest/Quest';

const engNameToPerson = {};
_(persons).values().forEach((person) => {
  engNameToPerson[person.engName] = person;
});

initQuestClient = function () {
'use strict';

initQuestLib();

var isLoading = new ReactiveVar(false);
var loadedQuest = new ReactiveVar(null);

Game.Quest.showDailyQuest = function() {
  isLoading.set(false);
  loadedQuest.set(null);

  var dailyQuest = Game.Quest.getDaily();

  if (dailyQuest.status == Game.Quest.status.INPROGRESS) {
    // show inprogress daily quest
    Game.Popup.show({
      template: (new Quest({
        hash: {
          personName: dailyQuest.who,
          title: dailyQuest.name,
          type: 'daily',
          isPrompt: true,
          isLoading: isLoading,
          questData: loadedQuest,
        }
      })).renderComponent(),
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
      template: (new Quest({
        hash: {
          personName: dailyQuest.who,
          title: dailyQuest.name,
          text: dailyQuest.result,
          type: 'daily',
          questData: loadedQuest,
        }
      })).renderComponent(),
    });
  }
};

Game.Quest.showQuest = function(id) {
  var currentQuest = Game.Quest.getOneById(id);
  if (!currentQuest) {
    return; // no active quest with given id
  }

  if (currentQuest.status == Game.Quest.status.FINISHED) {
    Meteor.call('quests.getInfo', currentQuest.engName, currentQuest.step, (err, data) => {
      const quest = new game.Quest(data);
      let reward = {};
  
      _(quest.reward).pairs().forEach(([id, count]) => {
        if (content[id]) {
          switch(content[id].type) {
            case 'artefact':
              reward.resources = reward.resources || {};
              reward.resources[id] = count;
              break;
            case 'resource':
              reward.resources = reward.resources || {};
              reward.resources[id] = count;
              break;
            case 'unit':
              reward.units = reward.units || {};
              reward.units[id] = count;
              break;
          }
        }
      });
  
      // quest finished, render reward popup
      Game.Popup.show({
        template: (new RewardPopup({
          hash: {
            reward,
            onGet: () => Meteor.call('quests.getReward', currentQuest.engName)
          },
        })).renderComponent(),
        hideClose: true,
      });
    });
  } else {
    // load full info
    isLoading.set(true);
    loadedQuest.set(null);

    // quest not finished, render reqular quest window
    Game.Popup.show({
      template: (new Quest({
        hash: {
          personName: currentQuest.who,
          title: currentQuest.name,
          type: 'quest',
          engName: currentQuest.engName,
          isPrompt: currentQuest.status == Game.Quest.status.PROMPT,
          isLoading: isLoading,
          questData: loadedQuest,
        }
      })).renderComponent(),
    });

    Meteor.call('quests.getInfo', currentQuest.engName, currentQuest.step, (err, data) => {
      isLoading.set(false);
      loadedQuest.set( new game.Quest(data) );

      if (data.slides) {
        const slides = [];

        for (let i = 1; i <= data.slides; i += 1) {
          slides.push({
            img: `/img/game/quests/${currentQuest.engName}/${currentQuest.step}/${i}.jpg`
          });
        }

        const stepNumber = parseInt(currentQuest.step.substr(8));
    
        Game.Popup.show({
          template: (new Gallery({
            hash: {
              slides,
              title: `Обучение — ${stepNumber} задание`,
            },
          })).renderComponent(),
        });
      }
    });
  }
};

Game.Quest.showGreeteing = function(personName) {
  isLoading.set(false);
  loadedQuest.set(null);

  // show character greeting text
  var text = Game.Persons[personName].defaultText;
  if (text && text.length > 0) {
    Game.Popup.show({
      template: (new Quest({
        hash: {
          personName,
          type: 'quest',
          text,
          isLoading: isLoading,
          questData: loadedQuest,
        }
      })).renderComponent(),
    })
  }
};
};