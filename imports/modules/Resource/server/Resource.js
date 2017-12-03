import Game from '/moduls/game/lib/main.game';
import LibResource from '../lib/Resource';

class Resource extends LibResource {
  add({ count, userId }) {
    Game.Resources.add({
      [this.legacyName]: count,
    }, userId);
  }
}

export default Resource;
