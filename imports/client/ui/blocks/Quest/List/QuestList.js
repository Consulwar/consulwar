import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { check } from 'meteor/check';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import './QuestList.html';
import './QuestList.styl';

class QuestList extends BlazeComponent {
  template() {
    return 'QuestList';
  }

  constructor({
    hash: {
      personName,
      currentQuest,
      className,
    },
  }) {
    super();

    this.className = className;

    check(personName, ReactiveVar);
    this.personName = personName;

    if (currentQuest) {
      check(currentQuest, ReactiveVar);
    }
    this.currentQuest = currentQuest;
  }

  getQuests() {
    const quests = Game.Quest.getAllByHero(this.personName.get());

    const questsList = _.map(quests, (quest) => {
      let statusName = '';
      if (quest.status === 0) {
        statusName = 'newest';
      } else if (quest.status === 3) {
        statusName = 'reward';
      }
      return {
        engName: quest.engName,
        title: quest.name,
        status: quest.status,
        statusName,
      };
    }).sort((a, b) => {
      if (a.status === 3 || b.status === 1) {
        return -1;
      }
      if (a.status === 1 || b.status === 3) {
        return 1;
      }
      return 0;
    });

    if (_.findIndex(questsList, { engName: this.currentQuest.get() }) === -1) {
      this.currentQuest.set(questsList[0].engName);
    }

    return questsList;
  }

  showQuest(event, id) {
    this.currentQuest.set(id);
  }
}

QuestList.register('QuestList');

export default QuestList;
