initBattleLib = function() {

game.Battle = function(options) {
	this.constructor = function(options) {
		this.name = options.name;
		this.engName = options.engName;
		this.description = options.description;
		this.honor = options.honor;
		this.chance = options.chance;
		this.level = options.level;

		Game.Battle.items[this.engName] = this;
	};

	this.type = 'battle';

	this.constructor(options);
};

game.Battle.status = {
	flight: 0,
	back: 1,
	ended: 2
};

game.Battle.count = {
	few: 'несколько',
	several: 'немного',
	pack: 'отряд',
	lots: 'толпа',
	horde: 'орда',
	throng: 'множество',
	swarm: 'туча',
	zounds: 'полчище',
	legion: 'легион',
	division: 'дивизия',
	corps: 'корпус',
	army: 'армия',
	group: 'группа армий',
	front: 'фронт'
};

Game.Battle = {
	items: {}
};

Game.Battle.result = {
	tie: 0,
	victory: 1,
	defeat: 2
};

initGalacticContentBattle();

// ------------------------------------------------------
// Debug methods
// ------------------------------------------------------

Game.Battle.debugShowMissions = function(type) {
	if (!Game.Battle.items[type]) {
		console.log('Нет такой миссии!');
		return;
	}

	var rollCount = function(name) {
		if (_.isNumber(name)) {
			return name;
		}

		switch (name) {
			case 'few': return 4;
			case 'several': return 9;
			case 'pack': return 19;
			case 'lots': return 49;
			case 'horde': return 99;
			case 'throng': return 249;
			case 'swarm': return 499;
			case 'zounds': return 999;
			case 'legion': return 4999;
			case 'division': return 9999;
			case 'corps': return 19999;
			case 'army': return 49999;
			case 'group': return 99999;
			case 'front': return 249999;
		}

		return 0;
	};

	var mission = Game.Battle.items[type];
	var levels = mission.level;

	console.log('----------------------------------------');
	console.log('    ', mission.name);
	console.log('----------------------------------------');
	console.log('Уровень     Здоровье                Атака');

	for (var key in levels) {
		var enemies = levels[key].enemies;
		var life = 0;
		var damage = 0;
		for (var name in enemies) {
			var count = rollCount(enemies[name]);
			life += count * Game.Unit.items.reptiles.fleet[name].characteristics.life;
			damage += count * Game.Unit.items.reptiles.fleet[name].characteristics.damage.max;
		}
		console.log(
			(key.toString() + '        ').substr(0, 8) + '    ' +
			(life.toString() + '                    ').substr(0, 20) + '    ' +
			(damage.toString() + '                    ').substr(0, 20)
		);
	}

	console.log('----------------------------------------');
};

};