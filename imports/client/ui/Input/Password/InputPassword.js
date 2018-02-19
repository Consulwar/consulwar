import InputString from '../String/InputString';

class InputPassword extends InputString {
  template() {
    return 'InputString';
  }
  onCreated() {
    this.type = 'password';
  }
}

InputPassword.register('InputPassword');

export default InputPassword;
