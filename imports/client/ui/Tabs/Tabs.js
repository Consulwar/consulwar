import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './Tabs.html';
import './Tabs.styl';

class Tabs extends BlazeComponent {
  template() {
    return 'Tabs';
  }
  constructor({
    hash: {
      tabs,
      className,
    },
  }) {
    super();

    this.tabs = tabs;
    this.className = className;
  }

  switchTab(event, index) {
    const tabs = this.tabs.get();

    if (!tabs[index].isActive) {
      tabs.forEach((item, i) => {
        if (i === index) {
          tabs[i].isActive = true;
        } else {
          delete tabs[i].isActive;
        }
      });
      this.tabs.set(tabs);
    }
  }
}

Tabs.register('Tabs');

export default Tabs;
