const Status = {
  progress: 1,
  finish: 2,
};

const USER_SIDE = '1';
const ENEMY_SIDE = '2';

const isBattle1x1 = function(battle) {
  return !(_(battle.initialUnits)
    .values()
    .some(side => _(side).keys().length > 1 || (
      _(side)
        .values()
        .some(player => player.length > 1)
    ))
  );
}

export default {
  Status,
  USER_SIDE,
  ENEMY_SIDE,
  isBattle1x1,
};
