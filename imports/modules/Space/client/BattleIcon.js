import { L } from '/moduls/game/lib/importCompability';
import Space from './space';
import Game from '../../../../moduls/game/lib/main.game';

class BattleIcon {
  constructor({
    battleEventId,
    battleEvent,
    mapView,
    origin = { x: 0, y: 0 },
    shipsLayer,
  }) {
    this.mapView = mapView;

    const icon = L.icon({
      iconUrl: '/img/game/battle/battleIcon.svg',
      iconSize: [30, 30],
    });
    const position = battleEvent.data.targetPosition;
    this.marker = L.marker(
      [origin.x + position.x, origin.y + position.y],
      { icon },
    ).addTo(shipsLayer);

    this.marker.on('click', function(event) {
      Game.Cosmos.showBattlePopup(battleEvent.data.battleId, true, origin);
      L.DomEvent.stopPropagation(event);
    });

    this.watchEvent(battleEventId);
  }

  watchEvent(eventId) {
    if (this.eventWatcher) {
      this.eventWatcher.stop();
    }

    this.eventWatcher = Space.collection.find({ _id: eventId }).observeChanges({
      removed: () => {
        this.removeFromMap();
        this.eventWatcher.stop();
      },
    });
  }

  removeFromMap() {
    this.marker.remove();
  }
}

export default BattleIcon;
