import Input from '../Input';
import './InputString.html';

class InputString extends Input {
  template() {
    return 'InputString';
  }
}

InputString.register('InputString');

export default InputString;
