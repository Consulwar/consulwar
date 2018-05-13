import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { check } from 'meteor/check';
import './Tabs.html';
import './Tabs.styl';

class Tabs extends BlazeComponent {
  template() {
    return 'Tabs';
  }
  constructor({
    hash: {
      key,
      className,
    },
  }) {
    super();

    this.className = className;

    this.tabs = new ReactiveVar([]);

    check(key, ReactiveVar);
    this.key = key;
  }

  switchTab(event, index) {
    this.key.set(this.tabs.get()[index].value);
  }

  addTab(name, value) {
    const tabs = this.tabs.get();
    const index = tabs.length;
    const tab = {
      name,
      value,
    };
    // adding small tab object to local ReactiveVar
    tabs.push(tab);
    this.tabs.set(tabs);

    // actions for parent component
    tab.setActive = () => this.switchTab(null, index);
    tab.isActive = () => {
      if (this.key.get() === value) {
        return true;
      }
      return false;
    };
    // return full tab object to parent
    return tab;
  }
}

Tabs.register('Tabs');

export default Tabs;
