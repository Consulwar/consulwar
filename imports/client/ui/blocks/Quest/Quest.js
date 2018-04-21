import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import { _ } from 'lodash';
import content from '/imports/content/client';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/blocks/Person/Image/PersonImage';
import '/imports/client/ui/blocks/Reward/Reward';
import './Quest.html';
import './Quest.styl';

class Quest extends BlazeComponent {
  template() {
    return 'Quest';
  }

  constructor({
    hash: {
      engName,
      personName,
      type,
      title,
      text,
      isPrompt,
      isLoading,
      questData,
    },
  }) {
    super();
    this.engName = engName;
    this.personName = personName || 'tamily';
    this.type = type;
    this.title = title;
    this.text = text;
    this.isPrompt = isPrompt;
    this.isLoading = isLoading;
    this.questData = questData;
  }

  getPerson() {
    return Game.Persons[this.personName];
  }

  getOptions() {
    if (this.isLoading.get()) {
      return null; // don't show options during loading
    }

    const quest = this.questData.get();

    // daily quest answers
    if (quest && quest.answers) {
      return _.map(quest.answers, (text, name) => ({
        name,
        text,
        mood: 'neutral',
      }));
    }

    // regular quest options
    if (quest && quest.options) {
      return _.map(quest.options, (values, name) => {
        const option = values;
        option.name = name;
        return option;
      });
    }

    return null;
  }

  getText() {
    const quest = this.questData.get();
    return quest ? quest.text : this.text;
  }

  getReward() {
    const quest = this.questData.get();

    if (quest && quest.reward) {
      const reward = {};
      _.toPairs(quest.reward).forEach(([id, count]) => {
        if (content[id]) {
          switch (content[id].type) {
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
            default:
              // unknown type
              break;
          }
        }
      });
      return reward;
    }

    return false;
  }

  sendAnswer(event, option) {
    if (this.type === 'quest') {
      Meteor.call('quests.sendAction', this.engName, option);
      this.removeComponent();
    } else {
      this.isLoading.set(true);
      Meteor.call(
        'quests.sendDailyAnswer',
        option,
        (err, result) => {
          this.isLoading.set(false);
          this.questData.set(result);
        },
      );
    }
  }
}

Quest.register('Quest');

export default Quest;
