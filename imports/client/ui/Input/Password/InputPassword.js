import Input from '../Input';
import './InputPassword.html';

class InputPassword extends Input {
  template() {
    return 'InputPassword';
  }
}

InputPassword.register('InputPassword');

export default InputPassword;
