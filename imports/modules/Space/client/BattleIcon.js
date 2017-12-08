import Space from './space';

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
      [origin.x + position.x, origin.y + position.y], { icon },
    ).addTo(shipsLayer);

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
