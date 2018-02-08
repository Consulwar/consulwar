initBeginnerBoostLib = function () {

Game.BeginnerBoost = {
  calculatePower: function (affectName) {
    let power = 1;
    const rank = Game.User.getLevel();

    switch (rank) {
      case 0:
        power = 1;
        break;
      case 1:
        power = 0.6;
        break;
      case 2:
        power = 0.3;
        break;
      case 3:
        power = 0.15;
        break;
      default:
        power = 0;
        break;
    }

    return power * Game.BeginnerBoost.POWER_UNIT[affectName];
  },
};

};