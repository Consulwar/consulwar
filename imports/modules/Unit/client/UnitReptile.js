import { Router } from 'meteor/iron:router';
import { _ } from 'meteor/underscore';
import UnitReptileAbstract from '../lib/UnitReptileAbstract';

class UnitReptile extends UnitReptileAbstract {
  constructor({ overlay, ...options }) {
    super({ ...options });

    this.overlay = overlay;

    this.path = `/img/game/${this.id}/`;

    this.icon = `${this.path}icon.png`;
    this.card = `${this.path}card.jpg`;
    this.overlayOwn = this.card;
  }

  url() {
    return Router.routes.reptileUnit.path({
      group: this.group,
      subgroup: this.subgroup,
      item: this.engName,
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

export default UnitReptile;
