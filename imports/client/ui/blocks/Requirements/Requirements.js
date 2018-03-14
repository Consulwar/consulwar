import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './Requirements.html';
import './Requirements.styl';

class Requirements extends BlazeComponent {
  template() {
    return 'Requirements';
  }

  constructor({
    hash: {
      requirements,
      className,
    },
  }) {
    super();
    this.requirements = requirements;
    this.className = className;
  }

  getRequirements() {
    const requiresList = [];
    this.requirements.forEach((requiredItem) => {
      const obj = requiredItem[0];
      const need = requiredItem[1] || 1;
      requiresList.push({
        name: obj.title,
        icon: obj.icon,
        url: obj.url(),
        type: obj.type,
        currentLevel: obj.getCurrentLevel(),
        needLevel: need,
      });
    });
    return requiresList;
  }
}

Requirements.register('Requirements');

export default Requirements;
