import { _ } from 'meteor/underscore';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import content from '/imports/content/client';
import helpers from '/imports/client/ui/helpers';
import './ContainerDrop.html';
import './ContainerDrop.styl';

class ContainerDrop extends BlazeComponent {
  template() {
    return 'ContainerDrop';
  }

  onCreated() {
    super.onCreated();

    this.drop = this.data('drop').map((drop) => {
      const obj = content[_(drop.profit).keys()[0]];

      return {
        obj,
        count: helpers.formatNumber(drop.profit[obj.id]),
        chance: helpers.formatNumber(drop.chance),
      };
    });
  }

}

ContainerDrop.register('ContainerDrop');

export default ContainerDrop;
