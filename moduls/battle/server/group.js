import { _ } from 'meteor/underscore';
import Unit from './unit';

const priorityDamageCoef = [0.4, 0.3, 0.2];

const restCoef = 1;

class Group {
  static fromObject(group) {
    const units = [];

    _(group).pairs().forEach(([id, unit]) => {
      units.push(new Unit(id, unit.weapon, unit.health, unit.count));
    });

    return new Group(units);
  }

  constructor(units) {
    this.units = units;
  }

  getDamageList(damageCoef) {
    return this.units.map(function(unit) {
      return [unit, unit.getTotalDamage() * damageCoef];
    });
  }

  getAliveCount() {
    return this.units.reduce(function(length, group) {
      return length + (group.count > 0 ? 1 : 0);
    }, 0);
  }

  receiveDamage(attackingUnit, totalDamage) {
    let targetDamages = this.fillTargetDamages(attackingUnit, totalDamage);
    let extraDamage = 0;

    targetDamages.forEach(([targetUnit, damage]) => {
      extraDamage += targetUnit.receiveDamage(attackingUnit, damage);
    });

    while (extraDamage > 0) {
      let aliveTargetUnits = targetDamages.filter(([unit]) => unit.health.total > 0);
      if (aliveTargetUnits.length <= 0) {
        break;
      }
      const damagePerUnit = extraDamage / aliveTargetUnits.length;
      extraDamage = 0;
      aliveTargetUnits.forEach(([targetUnit]) => {
        extraDamage += targetUnit.receiveDamage(attackingUnit, damagePerUnit);
      });
    }
  }

  fillTargetDamages(unit, allDamage) {
    let priorityTargets = unit.model.getTargets();
    let targetDamages = [];

    if (priorityTargets) {
      let priorities = new Array(priorityTargets.length);
      let other = [];

      // Заполняем массив приоритетных целей, если такие имеются в группе
      for (let target of this.units) {
        if (target.health.total <= 0) {
          continue;
        }

        let foundPriority = false;

        for (let i = 0; i < priorityTargets.length; i++) {
          let priorityTarget = priorityTargets[i];

          if (target.isEqualsToModel(priorityTarget)) {
            priorities[i] = target;
            foundPriority = true;
            break;
          }
        }

        if (!foundPriority) {
          other.push([target, 0]);
        }
      }

      let additionalDamageCoef = 1.0;

      // Вычисляем дополнительный урон, который будет распределен по всем не приоритетным целям
      for (let i = 0; i < priorityDamageCoef.length; i++) {
        let coef = priorityDamageCoef[i];
        if (priorities[i]) {
          additionalDamageCoef -= coef;
          targetDamages.push([priorities[i], allDamage * coef]);
        }
      }

      // Объединяем приоритетные цели со всеми остальными
      Array.prototype.push.apply(targetDamages, other);

      let additionalDamage = (allDamage * additionalDamageCoef) / targetDamages.length;

      // Распределяем дополнительный урон по всем
      for (let targetDamage of targetDamages) {
        targetDamage[1] += additionalDamage;
      }
    } else {
      // Если у атакующего юнита нет приоритетов - распределяем урон равномерно по всем в группе
      let damage = Math.floor(allDamage / this.getAliveCount());
      for (let target of this.units) {
        if (target.health.total > 0) {
          targetDamages.push([target, damage]);
        }
      }
    }

    return targetDamages;
  }
}

export default Group;