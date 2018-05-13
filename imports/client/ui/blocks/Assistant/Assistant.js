import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import './Assistant.html';
import './Assistant.styl';

class Assistant extends BlazeComponent {
  template() {
    return 'Assistant';
  }

  onCreated() {
    super.onCreated();

    this.routePersons = [
      {
        id: 'Person/Tamily',
        route: 'planet/Residential',
      },
      {
        id: 'Person/ThirdEngineering',
        route: 'planet/Military',
      },
      {
        id: 'Person/NatalyVerlen',
        route: 'research/Evolution',
      },
      {
        id: 'Person/Mechanic',
        route: 'research/Fleet',
      },
      {
        id: 'Person/SteelBolz',
        route: 'army/Space',
      },
      {
        id: 'Person/Vakhaebovich',
        route: 'army/Defense',
      },
      {
        id: 'Person/SoseuhTilps',
        route: 'army/Ground',
      },
    ];

    this.person = null;
    this.currentQuestId = new ReactiveVar();
    this.questStatus = new ReactiveVar();
    this.autorun(() => {
      if (this.getPerson()) {
        this.setStatus();
      }
    });
  }

  getPerson() {
    const currentRoute = Router.current().url;

    let personObj = null;
    this.routePersons.forEach((person) => {
      if (currentRoute.indexOf(person.route) !== -1) {
        personObj = Game.Persons[person.id];
      }
    });
    this.person = personObj;

    return personObj;
  }

  setStatus() {
    this.currentQuestId.set(false);
    this.questStatus.set(false);

    const quests = Game.Quest.getAllByHero(this.person.engName);

    const endedQuest = _.find(quests, { status: 3 });
    if (endedQuest) {
      this.currentQuestId.set(endedQuest.engName);
      this.questStatus.set('reward');
      return 'reward';
    }

    const newQuest = _.find(quests, { status: 0 });
    if (newQuest) {
      this.currentQuestId.set(newQuest.engName);
      this.questStatus.set('quest');
      return 'quest';
    }

    return false;
  }

  showQuest(event) {
    event.preventDefault();
    const personName = this.person.engName;
    const quests = Game.Quest.getOneByHero(personName);
    const questId = this.currentQuestId.get();

    if (quests) {
      if (questId) {
        Game.Quest.showQuest(questId);
      } else {
        Game.Quest.showQuest(quests.engName)
      }
    } else {
      Game.Quest.showGreeting(personName);
    }
  }
}

Assistant.register('Assistant');

export default Assistant;
