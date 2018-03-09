import { _ } from 'lodash';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import '../Menu.styl';
import './MenuArtifacts.html';
import './MenuArtifacts.styl';

class MenuArtifacts extends BlazeComponent {
  template() {
    return 'MenuArtifacts';
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
    const groupItems = _.groupBy(this.itemsObject, item => item.queue || item.group);
    return _.values(groupItems).map(group => _.values(group).map((item) => {
      const count = item.getCurrentCount();
      return {
        url: item.url(),
        icon: item.icon,
        title: item.title,
        count,
        isSelected: this.selected && item.id === this.selected.id,
      };
    }));
  }
}

MenuArtifacts.register('MenuArtifacts');

export default MenuArtifacts;
