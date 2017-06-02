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

	//todo remove
	toString() {
		return `{ name: ${this.name}, hp: ${this.health.total}, count: ${this.count} }`;
	}

	//todo remove
	toJSON() {
		return {
			name: this.name,
			hp: this.health.total,
			count: this.count
		};
	}

	get damage() {
		return Math.floor( this.weapon.damage * this.count);
	}

	isEqualsToModel(unit) {
		return this.side === unit.side && this.group === unit.group && this.name === unit.engName;
	}

	receiveDamage(unit, damage) {
		let rest;

		let eHPModifier = Math.max(1, (this.weapon.signature / unit.health.signature));
		let eHP = eHPModifier * this.health.total;

		if (eHP > damage) {
			this.health.total -= damage / eHPModifier;
			rest = 0;
		} else {
			rest = damage - eHP;
			this.health.total = 0;
		}

		return rest;
	}
}

export default Unit;