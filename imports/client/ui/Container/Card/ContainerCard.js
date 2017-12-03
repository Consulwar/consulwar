import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import ContainerDrop from '../drop/ContainerDrop';
import './ContainerCard.html';
import './ContainerCard.styl';

class ContainerCard extends BlazeComponent {
  template() {
    return 'ContainerCard';
  }

  onCreated() {
    super.onCreated();

    this.container = this.data('container');
  }

  generateTooltip(event) {
    $(event.currentTarget).attr({
      'data-tooltip': ContainerDrop.renderComponentToHTML(null, null, this.container),
      'data-tooltip-direction': 'w',
    });
  }
}

ContainerCard.register('ContainerCard');

export default ContainerCard;
