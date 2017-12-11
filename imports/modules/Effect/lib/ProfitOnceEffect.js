import Effect from './Effect';

class ProfitOnceEffect extends Effect {
  static get type() {
    return 'profitOnce';
  }

  static get isReduce() {
    return false;
  }

  constructor(options) {
    super(options);

    this.type = 'profitOnce';
    this.isReduce = false;
  }
}

export default ProfitOnceEffect;
