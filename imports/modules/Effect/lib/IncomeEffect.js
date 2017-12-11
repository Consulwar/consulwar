import Effect from './Effect';

class IncomeEffect extends Effect {
  static get type() {
    return 'income';
  }

  static get isReduce() {
    return false;
  }

  constructor(options) {
    super(options);

    this.type = 'income';
    this.isReduce = false;
  }
}

export default IncomeEffect;
