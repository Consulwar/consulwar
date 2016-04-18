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

};