import { _ } from 'meteor/underscore';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import containers from '/imports/content/Container/Fleet/client/';
import '../list/ContainerList';
import './ContainerPopup.html';
import './ContainerPopup.styl';

class ContainerPopup extends BlazeComponent {
  template() {
    return 'ContainerPopup';
  }

  onCreated() {
    super.onCreated();

    this.containers = _(containers).toArray();
  }
}

ContainerPopup.register('ContainerPopup');

export default ContainerPopup;
