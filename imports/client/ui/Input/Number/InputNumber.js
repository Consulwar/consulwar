import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';
import { check } from 'meteor/check';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import '../Input.styl';
import './InputNumber.html';


class InputNumber extends BlazeComponent {
  template() {
    return 'InputNumber';
  }

  constructor({ hash }) {
    super();
    const {
      value,
      isShowZero = true,
      min = 1,
      max,
      placeholder,
    } = hash;

    check(value, ReactiveVar);

    this.value = value;
    this.min = min;
    this.max = max;
    this.isShowZero = isShowZero;
    this.class = hash.class;
    this.placeholder = placeholder;
  }

  onInput({ currentTarget }) {
    let newVal = parseInt(currentTarget.value, 10) || null;

    if (newVal !== null) {
      if (this.max && newVal > this.max) {
        newVal = this.max;
      } else if (this.min >= 0 && newVal < 0) {
        newVal = '';
      }
      this.value.set(newVal > this.min ? newVal : this.min);
    } else {
      this.value.set(this.min);
    }

    // We need to update input manually in cases when
    // newVal equal to previous one, but not equal to one in input
    // happens when multiple input try above max (or below min) value
    $(currentTarget).val(this.isShowZero && newVal === null ? '' : newVal);
  }
  onFocus({ currentTarget }) {
    if (currentTarget.value === '1') {
      $(currentTarget).val('');
    }
  }

  isDisabled() {
    return this.max === 0;
  }
}

InputNumber.register('InputNumber');
