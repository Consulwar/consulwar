import { check } from 'meteor/check';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/underscore';
import './input.styl';
// TODO: Input rename

class Input extends BlazeComponent {
  constructor({ hash: {
    name,
    value,
    errors,
    required,
    disabled,
    validators = [],
    className,
    placeholder,
    minLength,
  } }) {
    super();

    check(name, String);
    this.name = name;
    if (errors) {
      check(errors, ReactiveDict);
    }
    this.errors = errors;
    if (value) {
      check(value, ReactiveVar);
    }
    this.value = value;
    check(validators, Array);
    this.validators = validators;
    this.className = className;
    this.placeholder = placeholder;

    if (required) {
      this.required = 'required';
      this.validators.push(
        (fieldValue, errorBack) => {
          if (!fieldValue || fieldValue.length === 0 || fieldValue === false) {
            errorBack(`${this.placeholder} - обязательно для заполнения`);
          } else {
            errorBack(false);
          }
        },
      );
    }
    if (minLength) {
      this.minLength = ({ minlength: minLength });
    }
    if (disabled) {
      this.isDisabled = ({ disabled: 'disabled' });
    }
  }

  setErrors(errors) {
    this.errors.set(this.name, errors);
  }

  addError() {
    this.find('input').classList.add('cw--input_errored');
  }
  removeError() {
    this.find('input').classList.remove('cw--input_errored');
  }

  validate() {
    const errors = [];
    this.validators.forEach((validator) => {
      let fieldData;
      if (this.value) {
        fieldData = this.value.get();
      } else if (this.checked) {
        fieldData = this.checked.get();
      }
      validator(fieldData, (error) => {
        if (error) {
          errors.push(error);
        }
        if (errors.length > 0) {
          this.setErrors(errors);
        } else {
          this.setErrors(null);
        }
      });
    });
  }

  onInput({ currentTarget }) {
    const newVal = currentTarget.value;
    this.value.set(newVal);
    this.validate();
  }
}

Input.register('Input');

export default Input;
