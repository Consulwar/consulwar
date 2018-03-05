import { Meteor } from 'meteor/meteor';
import AbstractCountableItem from '/imports/modules/Core/lib/AbstractCountableItem';
import MilitaryEffect from '/imports/modules/Effect/lib/MilitaryEffect';

let Game;
Meteor.startup(() => {
  // Temporary hack to avoid circular dependency
  // Must be changed to imports after
  // House, Cards, Achievements will be separate modules
  // eslint-disable-next-line global-require
  Game = require('/moduls/game/lib/main.game').default;
});

class UnitAbstract extends AbstractCountableItem {
  constructor({
    id,
    power,
    characteristics,
    targets = [],
    ...options
  }) {
    super({ id, ...options });

    this.targets = targets;

    if (power) {
      this.power = power;
    }

    this.characteristics = characteristics;

    // Legacy
    const idParts = id.split('/');
    if (idParts[2] === 'Ground') {
      this.group = idParts[idParts.length - 3];
      this.subgroup = idParts[idParts.length - 2];
    } else {
      this.group = idParts[idParts.length - 2];
    }
    this.engName = idParts[idParts.length - 1];
  }

  getBaseCharacteristics() {
    return Game.Helpers.deepClone(this.characteristics);
  }

  getCharacteristics(options = {}) {
    const characteristics = Game.Helpers.deepClone(this.characteristics);

    const result = MilitaryEffect.applyTo({
      ...options,
      target: this,
      obj: characteristics,
      hideEffects: false,
    });
    result.base = this.getBaseCharacteristics();

    return result;
  }

  getTargets() {
    return this.targets.map(id => this.constructor.getObject({ id }));
  }
}

export default UnitAbstract;
