import Effect from './Effect';

class MilitaryEffect extends Effect {
  static get type() {
    return 'military';
  }

  static get isReduce() {
    return false;
  }

  constructor(options) {
    super(options);

    this.type = 'military';
    this.isReduce = false;
  }
}

export default MilitaryEffect;
