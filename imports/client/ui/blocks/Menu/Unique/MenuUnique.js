import { _ } from 'lodash';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import '../Menu.styl';
import './MenuUnique.html';
import './MenuUnique.styl';

class MenuUnique extends BlazeComponent {
  template() {
    return 'MenuUnique';
  }

  constructor({
    hash: {
      items = [],
      selected,
    },
  } = { hash: {} }) {
    super();

    this.itemsObject = items;
    this.selected = selected;
  }

  items() {
    return _.values(this.itemsObject).map((item) => {
      let time = null;
      let nextLevel = null;
      const queue = item.getQueue();
      if (queue) {
        time = queue.finishTime - Game.getCurrentServerTime();
        nextLevel = queue.level;
      }
      const level = item.getCurrentLevel();
      return {
        url: item.url(),
        icon: item.icon,
        title: item.title,
        level,
        nextLevel,
        time,
        has: item.has(),
        сanBuild: item.canBuild(),
        isEnoughResources: item.isEnoughResources(),
        meetRequirements: item.meetRequirements(),
        inProgress: !!queue,
        isQueueBusy: !queue && item.isQueueBusy(),
        isMaxLevel: item.maxLevel === level,
        isSelected: this.selected && item.id === this.selected.id,
      };
    });
  }
}

MenuUnique.register('MenuUnique');

export default MenuUnique;
