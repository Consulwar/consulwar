import Effect from './Effect';

class SpecialEffect extends Effect {
  static get type() {
    return 'special';
  }

  static get isReduce() {
    return false;
  }

  constructor(options) {
    super(options);

    this.type = 'special';
    this.isReduce = false;
  }
}

export default SpecialEffect;
