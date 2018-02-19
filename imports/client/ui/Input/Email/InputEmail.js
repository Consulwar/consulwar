import InputString from '../String/InputString';

class InputEmail extends InputString {
  template() {
    return 'InputString';
  }

  onCreated() {
    this.type = 'email';

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
    localValidator.forEach(
      singleValidator => this.validators.push(singleValidator),
    );
  }

}

InputEmail.register('InputEmail');

export default InputEmail;
