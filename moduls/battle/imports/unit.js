class Unit {
	constructor(side, group, name, count) {
		this.side = side;
		this.group = group;
		this.name = name;

		this.model = Game.Unit.items[side][group][name];

		let characteristics = this.model.earthCharacteristics; //todo

		this.weapon = characteristics.weapon;
		this.health = characteristics.health;

		this.hp = this.health.armor * Game.Unit.rollCount(count);

		let damage = this.weapon.damage;

		//todo this.baseDamage = Game.Random.interval( damage.min, damage.max );
		this.baseDamage = Math.round( (damage.min + damage.max) / 2 );
	}

	get count() {
		return Math.ceil(this.hp / this.health.armor);
	}

	get damage() {
		return Math.floor( this.baseDamage * this.count);
	}

	isEqualsToModel(unit) {
		return this.side === unit.side && this.group === unit.group && this.name === unit.engName;
	}

	//todo remove
	toString() {
		return `{ name: ${this.name}, hp: ${this.hp}, count: ${this.count} }`;
	}

	//todo remove
	toJSON() {
		return {
			name: this.name,
			hp: this.hp,
			count: this.count
		};
	}

	receiveDamage(unit, damage) {
		let rest;

		let eHPModifier = Math.max(1, (this.weapon.signature / unit.health.signature));
		let eHP = eHPModifier * this.hp;

		if (eHP > damage) {
			this.hp -= damage / eHPModifier;
			rest = 0;
		} else {
			rest = damage - eHP;
			this.hp = 0;
		}

		return rest;
	}
}

export default Unit;