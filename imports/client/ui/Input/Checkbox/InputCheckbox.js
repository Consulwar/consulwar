import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { check } from 'meteor/check';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import './InputCheckbox.html';
import './InputCheckbox.styl';

class InputCheckbox extends BlazeComponent {
  constructor({ hash: {
    name,
    required,
    errors,
    checked,
    validators = [],
    className,
    label,
  } }) {
    super();

    check(name, String);
    this.name = name;

    if (errors) {
      check(errors, ReactiveDict);
    }
    this.errors = errors;

    check(validators, Array);
    this.validators = validators;

    this.className = className;
    this.label = label;

    check(checked, ReactiveVar);
    this.isChecked = checked;

    // required validation
    if (required) {
      this.required = 'required';
      this.validators.push(
        (fieldChecked, errorBack) => {
          if (!fieldChecked) {
            errorBack('Обязательное поле');
          } else {
            errorBack(false);
          }
        },
      );
    }
  }

  setErrors(errors) {
    this.errors.set(this.name, errors);
  }

  validate() {
    const errors = [];
    this.validators.forEach((validator) => {
      validator(this.isChecked.get(), (error) => {
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

  onChange({ currentTarget }) {
    this.isChecked.set(currentTarget.checked);
    this.validate();
  }
}

InputCheckbox.register('InputCheckbox');

export default InputCheckbox;
