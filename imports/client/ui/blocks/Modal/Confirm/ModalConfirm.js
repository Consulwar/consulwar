import Modal from '../Modal';
import './ModalConfirm.html';
import './ModalConfirm.styl';

class ModalConfirm extends Modal {
  template() {
    return 'ModalConfirm';
  }

  constructor({
    hash: {
      legend = 'Подтвердите действие',
      message,
      onAccept = () => {},
      onCancel = () => {},
      ...options
    },
  }) {
    super({ hash: options });

    this.legend = legend;
    this.message = message;
    this.onAccept = onAccept;
    this.onCancel = onCancel;
  }

  accept() {
    this.onAccept.call();
    this.closeWindow();
  }

  cancel() {
    if (typeof this.onCancel === 'function') {
      this.onCancel.call();
    }
    this.closeWindow();
  }
}

ModalConfirm.register('ModalConfirm');

export default ModalConfirm;
