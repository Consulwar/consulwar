import Space from './space';

class BattleIcon {
  constructor({
    battleEventId,
    battleEvent,
    mapView,
  }) {
    this.mapView = mapView;

    const icon = L.icon({
      iconUrl: '/img/game/battle/battleIcon.svg',
      iconSize: [30, 30],
    });
    const position = battleEvent.data.targetPosition;
    this.marker = L.marker([position.x, position.y], { icon }).addTo(mapView);

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
