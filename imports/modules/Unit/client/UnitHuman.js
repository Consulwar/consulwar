import { Router } from 'meteor/iron:router';
import { _ } from 'meteor/underscore';
import fleetUps from '/imports/content/Research/Fleet/client';
import UnitHumanAbstract from '../lib/UnitHumanAbstract';

class UnitHuman extends UnitHumanAbstract {
  constructor({ overlay, ...options }) {
    super({ ...options });

    this.overlay = overlay;

    this.color = 'cw--color_metal';

    this.path = `/img/game/${this.id}/`;

    this.icon = `${this.path}icon.png`;
    this.card = `${this.path}card.jpg`;
    this.overlayOwn = `${this.path}item.png`;
  }

  getStar() {
    if (!fleetUps[`Research/Fleet/${this.engName}`]) {
      return 0;
    }

    const level = fleetUps[`Research/Fleet/${this.engName}`].getCurrentLevel();
    if (level < 10) {
      return 0;
    } else if (level < 50) {
      return 1;
    } else if (level < 100) {
      return 2;
    }
    return 3;
  }

  url({
    group,
    subgroup,
    item,
  } = { group: this.group, subgroup: this.subgroup, item: this.engName }) {
    return Router.routes.unit.path({
      group,
      subgroup,
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

export default UnitHuman;
