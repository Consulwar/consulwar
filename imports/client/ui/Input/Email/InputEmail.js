import InputString from '../String/InputString';

class InputEmail extends InputString {
  template() {
    return 'InputString';
  }

  onCreated() {
    super.onCreated();

    this.type = 'email';
  }
}

InputEmail.register('InputEmail');

export default InputEmail;
