class Unit {
	constructor(side, group, name, weapon, health, count) {
		this.side = side;
		this.group = group;
		this.name = name;

		this.model = Game.Unit.items[side][group][name];

		this.weapon = weapon;
		this.health = health;

		this.count = count;
	}

	getTotalDamage() {
		let damage = this.weapon.damage;
		return Math.floor(Game.Random.interval(damage.min * this.count, damage.max * this.count) / 2 );
	}

	isEqualsToModel(unit) {
		return this.name === unit.engName && this.group === unit.group && this.side === unit.side;
	}

	// Получение damage от unit
	// Возращает "лишний" урон, не примененный на текущего юнита
	receiveDamage(unit, damage) {
		let restHP;

		let eHPModifier = Math.max(1, (unit.weapon.signature / this.health.signature));
		let eHP = Math.floor(eHPModifier * this.health.total);

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