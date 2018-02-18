import Input from '../Input';
import './InputEmail.html';

class InputEmail extends Input {
  template() {
    return 'InputEmail';
  }

  onCreated() {
    // TODO: удалить тест локального валидатора
    const localValidator = [
      (value, errorBack) => {
        if (value.length < 3) {
          errorBack('Минимум 3 символа');
        } else {
          errorBack(false);
        }
      },
    ];
    localValidator.forEach(singleValidator => this.validators.push(singleValidator));
  }

}

InputEmail.register('InputEmail');

export default InputEmail;
