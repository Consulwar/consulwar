import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import allFleetContainers from '/imports/content/Container/Fleet/client';
import humanUnits from '/imports/content/Unit/Human/client';
import persons from '/imports/content/Person/client';
import './Reward.html';
import './Reward.styl';

class Reward extends BlazeComponent {
  template() {
    return 'Reward';
  }

  constructor({
    hash: {
      reward,
      onGet,
    },
  }) {
    super();
    this.reward = reward;
    this.onGet = onGet;
  }

  getResources() {
    if (!this.reward || !this.reward.resources) {
      return null;
    }
    return this.reward.resources;
  }

  getUnits() {
    if (!this.reward || !this.reward.units) {
      return null;
    }

    const { units } = this.reward;
    const result = [];

    _.toPairs(units).forEach(([id, count]) => {
      result.push({
        icon: humanUnits[id].card,
        title: humanUnits[id].title,
        count,
      });
    });

    return result.length > 0 ? result : null;
  }

  getCards() {
    if (!this.reward || !this.reward.cards) {
      return null;
    }

    const { cards } = this.reward;
    const result = [];

    _.toPairs(cards).forEach(([name, count]) => {
      const item = Game.Cards.getItem(name);
      if (item) {
        result.push({
          icon: item.icon(),
          title: item.name,
          count,
        });
      }
    });

    return result.length > 0 ? result : null;
  }

  getContainers() {
    if (!this.reward || !this.reward.containers) {
      return null;
    }

    const result = [];

    _.toPairs(this.reward.containers).forEach(([id, count]) => {
      result.push({
        obj: allFleetContainers[id],
        count,
      });
    });

    return result.length > 0 ? result : null;
  }

  getHouseItems() {
    if (!this.reward || !this.reward.houseItems) {
      return null;
    }

    const items = this.reward.houseItems;
    const result = [];

    _.keys(items).forEach((group) => {
      _.keys(items[group]).forEach((name) => {
        result.push({
          icon: `/img/game/house/${group}/i/${name}.png`,
        });
      });
    });

    return result.length > 0 ? result : null;
  }

  getPersonSkin() {
    if (!this.reward || !this.reward.personSkin) {
      return null;
    }

    const result = [];

    _.toPairs(this.reward.personSkin).forEach(([personId, skins]) => {
      _.keys(skins).forEach((skinId) => {
        result.push(persons[personId].getImage(skinId));
      });
    });

    return result.length > 0 ? result : null;
  }

  takeReward() {
    if (this.onGet) {
      this.onGet();
    }

    this.removeComponent();
  }
}

Reward.register('Reward');

export default Reward;
