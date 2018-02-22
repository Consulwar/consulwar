import Input from '../Input';
import './InputString.html';

class InputString extends Input {
  template() {
    return 'InputString';
  }
  onCreated() {
    this.type = 'text';
  }
}

InputString.register('InputString');

export default InputString;
