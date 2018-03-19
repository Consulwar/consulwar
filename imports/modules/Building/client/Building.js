import { Router } from 'meteor/iron:router';
import { _ } from 'meteor/underscore';
import BuildingAbstract from '../lib/BuildingAbstract';

class Building extends BuildingAbstract {
  constructor({ overlay, ...options }) {
    super({ ...options });
    this.overlay = overlay;
    this.path = `/img/game/${this.id}/`;

    this.icon = `${this.path}icon.png`;
    this.requirementIcon = `${this.path}r.jpg`;
    this.card = `${this.path}card.jpg`;
    this.overlayOwn = `${this.path}item.png`;
  }

  url({
    group,
    item,
  } = { group: this.group, item: this.engName }) {
    return Router.routes.building.path({
      group,
      item,
    });
  }

  getOverlayImage(currentLevel = this.getCurrentLevel()) {
    // Select highest level for overlay
    const fitLevels = _.filter(this.overlay.levels, function(level) {
      return level <= currentLevel;
    });

    const level = _.max(fitLevels);

    if (level !== -Infinity) {
      return `${this.path}${level}.${this.overlay.type || 'png'}`;
    }
    return null;
  }

  getOverlay() {
    if (!this.overlay) {
      return null;
    }

    const progress = this.getQueue();

    if (progress) {
      progress.img = this.getOverlayImage(progress.level);
    }

    const result = {
      img: this.getOverlayImage(),
      x: this.overlay.x,
      y: this.overlay.y,
      z: this.overlay.z,
      progress,
    };

    return result;
  }
}

export default Building;
