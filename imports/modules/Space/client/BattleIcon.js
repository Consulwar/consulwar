import Space from './space';

class BattleIcon {
  constructor({
    battleEventId,
    battleEvent,
    mapView,
    origin = [0, 0],
    shipsLayer,
  }) {
    this.mapView = mapView;

    const icon = L.icon({
      iconUrl: '/img/game/battle/battleIcon.svg',
      iconSize: [30, 30],
    });
    const position = battleEvent.data.targetPosition;
    this.marker = L.marker(
      [origin[0] + position.x, origin[1] + position.y], { icon },
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
