import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import Game from '/moduls/game/lib/main.game';
import './QuestWobbler.html';
import './QuestWobbler.styl';

class QuestWobbler extends BlazeComponent {
  template() {
    return 'QuestWobbler';
  }

  onCreated() {
    super.onCreated();

    this.personIcon = Game.Persons['Person/Tamily'].getIcon();
    this.tutorialData = new ReactiveVar();
  }

  getTutorial() {
    const quest = Game.Quest.getOneById('Tutorial');
    if (quest && quest.status === Game.Quest.status.INPROGRESS) {
      const nameArray = quest.name.split(',');
      this.tutorialData.set(nameArray);
      return true;
    }
    return false;
  }

  showTutorial(event) {
    event.preventDefault();
    Game.Quest.showQuest('Tutorial');
  }
}

QuestWobbler.register('QuestWobbler');

export default QuestWobbler;
