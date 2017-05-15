import Unit from './unit';

const priorityDamageCoefs = [0.4, 0.3, 0.2];

const restCoef = 0.8;

class Group {

	constructor(units) {
		this.units = units;
	}

	getDamageList() {
		return this.units.map(function(unit) {
			return [unit, unit.damage];
		});
	}

	getAliveObject() {
		let result = {};

		for (let unit of this.units) {
			let count = unit.count;
			if (count > 0) {
				if (!result[unit.side]) {
					result[unit.side] = {};
				}
				if (!result[unit.side][unit.group]) {
					result[unit.side][unit.group] = {};
				}
				result[unit.side][unit.group][unit.name] = count;
			}
		}

		return result;
	}

	getAliveCount() {
		return this.units.reduce(function(length, group) {
			return length + (group.count > 0 ? 1 : 0);
		}, 0);
	}

	receiveDamage(unit, allDamage) {
		let targetDamages = this.fillTargetDamages(unit, allDamage);

		let additionalDamage = 0;

		let length = targetDamages.length;
		for (let i = 0; i < length; i++) {
			let [target, damage] = targetDamages[i];

			let rest = target.receiveDamage(unit, damage + additionalDamage);

			// Распределяем оставшийся от атаки урон на еще не атакованных юнитов
			additionalDamage += Math.round(rest * restCoef) / (length - (i+1));
		}
	}

	fillTargetDamages(unit, allDamage) {
		let priorityTargets = unit.model.targets();
		let targetDamages = [];

		if (priorityTargets) {
			let priorities = new Array(priorityTargets.length);
			let other = [];

			// Заполняем массив приоритетных целей, если такие имеются в группе
			for (let target of this.units) {
				if (target.hp <= 0) {
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
			for (let i = 0; i < priorityDamageCoefs.length; i++) {
				let coef = priorityDamageCoefs[i];
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
				if (target.hp > 0) {
					targetDamages.push([target, damage]);
				}
			}
		}

		return targetDamages;
	}

	//todo remove
	toJSON() {
		return this.units.map(function(unit) {
			return unit.toString();
		});
	}

	static fromObject(group) {
		let units = [];

		for (let sideName in group) {
			if (!group.hasOwnProperty(sideName)) {
				continue;
			}
			let side = group[sideName];

			for (let groupName in side) {
				if (!side.hasOwnProperty(groupName)) {
					continue;
				}

				let group = side[groupName];

				for (let unitName in group) {
					if (!group.hasOwnProperty(unitName)) {
						continue;
					}

					let count = group[unitName];

					units.push(new Unit(sideName, groupName, unitName, count));
				}
			}
		}

		return new Group(units);
	}
}

export default Group;