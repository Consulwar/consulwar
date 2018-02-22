import InputString from '../String/InputString';

class InputPassword extends InputString {
  template() {
    return 'InputString';
  }
  onCreated() {
    super.onCreated();

    this.type = 'password';
  }
}

InputPassword.register('InputPassword');

export default InputPassword;
