import { check } from 'meteor/check';
import { ReactiveVar } from 'meteor/reactive-var';
import Input from '../Input';
import './InputCheckbox.html';
import './InputCheckbox.styl';

class InputCheckbox extends Input {
  constructor({
    hash: {
      checked,
      label,
      ...options
    },
  }) {
    super({ hash: options });

    this.label = label;

    check(checked, ReactiveVar);
    this.checked = checked;

    if (this.checked.get() === true) {
      this.isChecked = ({ checked: 'checked' });
    }
  }

  onChange({ currentTarget }) {
    this.checked.set(currentTarget.checked);
    this.validate();
  }
}

InputCheckbox.register('InputCheckbox');

export default InputCheckbox;
