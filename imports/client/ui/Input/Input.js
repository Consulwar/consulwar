import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import './input.styl';
// TODO: Input rename

class Input extends BlazeComponent {
  constructor({ hash: {
    name,
    value,
    errors,
    validators = [],
    className,
    placeholder,
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
  }

  setErrors(errors) {
    this.errors.set(this.name, errors);
  }

  onInput({ currentTarget }) {
    const newVal = currentTarget.value;

    const errors = [];
    this.validators.forEach((validator) => {
      validator(newVal, (error) => {
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
}

Input.register('Input');

export default Input;
