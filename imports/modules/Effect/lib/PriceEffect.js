import Effect from './Effect';

class PriceEffect extends Effect {
  static get type() {
    return 'price';
  }

  static get isReduce() {
    return true;
  }

  constructor(options) {
    super(options);

    this.type = 'price';
    this.isReduce = true;
  }
}

export default PriceEffect;
