initBattleLib = function() {
'use strict';

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

game.Battle.countNumber = {
  few: {min: 1, max: 4},
  several: {min: 5, max: 9},
  pack: {min: 10, max: 19},
  lots: {min: 20, max: 49},
  horde: {min: 50, max: 99},
  throng: {min: 100, max: 249},
  swarm: {min: 250, max: 499},
  zounds: {min: 500, max: 999},
  legion: {min: 1000, max: 4999},
  division: {min: 5000, max: 9999},
  corps: {min: 10000, max: 19999},
  army: {min: 20000, max: 49999},
  group: {min: 50000, max: 99999},
  front: {min: 100000, max: 249999}
};

Game.Battle = {
  items: {}
};

Game.Battle.result = {
  tie: 0,
  victory: 1,
  defeat: 2,
  damage: 3,
  damageVictory: 4
};

Game.Battle.resultNames = {
  [Game.Battle.result.tie]: 'tie',
  [Game.Battle.result.victory]: 'victory',
  [Game.Battle.result.defeat]: 'defeat',
  [Game.Battle.result.damage]: 'damage',
  [Game.Battle.result.damageVictory]: 'damageVictory'
};

initGalacticContentBattle();

};