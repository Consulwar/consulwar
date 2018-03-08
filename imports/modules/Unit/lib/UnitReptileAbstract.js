import UnitAbstract from './UnitAbstract';

class UnitReptileAbstract extends UnitAbstract {
  constructor(options) {
    super(options);

    this.type = 'reptileUnit';
  }

  // No way to build this type of unit
  // eslint-disable-next-line class-methods-use-this
  canBuild() {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  getCount() {
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  getTotalCount() {
    return null;
  }
}

export default UnitReptileAbstract;
