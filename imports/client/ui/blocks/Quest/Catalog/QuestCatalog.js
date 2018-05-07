import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'lodash';
import { $ } from 'meteor/jquery';
import Game from '/moduls/game/lib/main.game';
import persons from '/imports/content/Person/client';
import '/imports/client/ui/Tabs/Tabs';
import '/imports/client/ui/blocks/Quest/Quest';
import '/imports/client/ui/blocks/Quest/List/QuestList';
import './QuestCatalog.html';
import './QuestCatalog.styl';

class QuestCatalog extends BlazeComponent {
  template() {
    return 'QuestCatalog';
  }

  constructor({
    hash: {
      personName,
      questId,
    },
  }) {
    super();

    this.personName = new ReactiveVar(personName);
    this.questId = new ReactiveVar(questId);
    this.quest = new ReactiveVar({});
    this.questData = new ReactiveVar();
    this.isLoading = new ReactiveVar(true);
  }

  onRendered() {
    super.onRendered();

    [this.tabsComponent] = this.childComponents('Tabs');
    this.createTabs();

    this.personNameTemp = this.personName.get();
    this.autorun(() => {
      // mobile: show List while changing person
      if (this.personName.get() !== this.personNameTemp) {
        this.hideQuest();
        this.personNameTemp = this.personName.get();
      }

      this.getQuestData();
    });
  }

  showQuestExt() {
    return () => {
      $('.cw--QuestCatalog').addClass('cw--QuestCatalog_showQuest');
    };
  }
  hideQuest() {
    $('.cw--QuestCatalog').removeClass('cw--QuestCatalog_showQuest');
  }

  createTabs() {
    const personsList = _.remove(_.map(persons, (person) => {
      if (Game.Quest.getOneByHero(person.engName)) {
        return { engName: person.engName, title: person.title };
      }
      return null;
    }), item => item !== null);

    personsList.forEach((person) => {
      this.tabsComponent.addTab(person.title, person.engName);
    });
  }

  getQuestData() {
    const currentQuest = Game.Quest.getOneById(this.questId.get());

    if (currentQuest.status === Game.Quest.status.FINISHED) {
      Game.Quest.showReward(currentQuest);
    }

    this.isLoading.set(true);
    this.questData.set(null);

    this.quest.set({
      title: currentQuest.name,
      engName: currentQuest.engName,
      isPrompt: currentQuest.status === Game.Quest.status.PROMPT,
    });

    Game.Quest.getData(currentQuest, (data) => {
      if (data.slides) {
        Game.Quest.showSlides(currentQuest, data.slides);
      }
      this.isLoading.set(false);
      this.questData.set(data);
    });
  }
}

QuestCatalog.register('QuestCatalog');

export default QuestCatalog;
