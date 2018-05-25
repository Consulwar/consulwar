import { ReactiveVar } from 'meteor/reactive-var';
import Modal from '../Modal';
import './ModalPrompt.html';
import './ModalPrompt.styl';

class ModalPrompt extends Modal {
  template() {
    return 'ModalPrompt';
  }

  constructor({
    hash: {
      type,
      value,
      onAccept = () => {},
      onCancel = () => {},
      ...options
    },
  }) {
    super({ hash: options });

    this.type = type;
    this.value = new ReactiveVar(value);
    this.onAccept = onAccept;
    this.onCancel = onCancel;
  }

  accept() {
    this.onAccept.call(null, this.value.get());
    this.closeWindow();
  }

  cancel() {
    if (typeof this.onCancel === 'function') {
      this.onCancel.call(null, this.value.get());
    }
    this.closeWindow();
  }
}

ModalPrompt.register('ModalPrompt');

export default ModalPrompt;
