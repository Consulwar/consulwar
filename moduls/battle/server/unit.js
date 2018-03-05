import units from '/imports/content/Unit/server';

class Unit {
  constructor(id, weapon, health, count) {
    this.id = id;

    this.model = units[id];

    this.weapon = weapon;
    this.health = health;

    this.count = count;
  }

  getTotalDamage() {
    const damage = this.weapon.damage;
    return Game.Random.interval(damage.min * this.count, damage.max * this.count);
  }

  isEqualsToModel(unit) {
    return this.id === unit.id;
  }

  // Получение damage от unit
  // Возращает "лишний" урон, не примененный на текущего юнита
  receiveDamage(unit, damage) {
    let restHP;

    const eHPModifier = Math.max(1, (unit.weapon.signature / this.health.signature));
    const eHP = Math.floor(eHPModifier * this.health.total);

    if (eHP > damage) {
      this.health.total -= Math.floor(damage / eHPModifier);
      restHP = 0;
    } else {
      restHP = damage - eHP;
      this.health.total = 0;
    }

    return restHP;
  }
}

export default Unit;
