import { _ } from 'lodash';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import '../Menu.styl';
import './MenuUnits.html';
import './MenuUnits.styl';

class MenuUnits extends BlazeComponent {
  template() {
    return 'MenuUnits';
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
    const groupItems = _.groupBy(this.itemsObject, item => (
      item.queue || item.subgroup || item.group
    ));

    return _.values(groupItems).map(group => _.values(group).map((item) => {
      if (item.type === 'reptileUnit') {
        return {
          url: item.url(),
          icon: item.icon,
          title: item.title,
          count: null,
          totalCount: null,
          has: true,
          meetRequirements: true,
          isEnoughResources: true,
          isSelected: this.selected && item.id === this.selected.id,
        };
      }

      let time = null;
      let addCount = null;
      const queue = item.getQueue();
      if (queue) {
        time = queue.finishTime - Game.getCurrentServerTime();
        addCount = queue.count;
      }
      const count = item.getCurrentCount();
      return {
        url: item.url(),
        icon: item.icon,
        title: item.title,
        count,
        totalCount: item.getTotalCount(),
        addCount,
        time,
        has: item.has(),
        сanBuild: item.canBuild(),
        isEnoughResources: item.isEnoughResources(),
        meetRequirements: item.meetRequirements(),
        inProgress: !!queue,
        isQueueBusy: !queue && item.isQueueBusy(),
        isSelected: this.selected && item.id === this.selected.id,
      };
    }));
  }
}

MenuUnits.register('MenuUnits');

export default MenuUnits;
