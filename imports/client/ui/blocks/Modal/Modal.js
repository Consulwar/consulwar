import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './Modal.styl';

class Modal extends BlazeComponent {
  template() {
    return 'Modal';
  }

  constructor({
    hash: {
      legend,
    },
  }) {
    super();

    this.legend = legend;
  }

  closeWindow() {
    this.removeComponent();
  }
}

Modal.register('Modal');

export default Modal;
