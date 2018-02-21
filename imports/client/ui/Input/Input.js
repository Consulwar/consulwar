import { check } from 'meteor/check';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import './input.styl';
// TODO: Input rename

class Input extends BlazeComponent {
  constructor({ hash: {
    name,
    value,
    errors,
    required,
    validators = [],
    className,
    placeholder,
    minLength,
  } }) {
    super();

    check(name, String);
    check(value, ReactiveVar);
    if (errors) {
      check(errors, ReactiveDict);
    }

    check(validators, Array);
    this.name = name;
    this.value = value;
    this.errors = errors;
    this.validators = validators;
    this.className = className;
    this.placeholder = placeholder;

    if (required) {
      this.required = 'required';
      this.validators.push(
        (fieldValue, errorBack) => {
          if (!fieldValue || fieldValue.length === 0) {
            errorBack(`${this.placeholder} - обязательно для заполнения`);
          } else {
            errorBack(false);
          }
        },
      );
    }
    if (minLength) {
      this.minLength = () => ({ minlength: minLength });
    }
  }

  setErrors(errors) {
    this.errors.set(this.name, errors);
  }

  validate() {
    const errors = [];
    this.validators.forEach((validator) => {
      validator(this.value.get(), (error) => {
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
