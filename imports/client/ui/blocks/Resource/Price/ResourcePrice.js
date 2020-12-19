import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { _ } from 'lodash';
import { priceTooltip } from '/moduls/game/client/helper';
import Game from '/moduls/game/lib/main.game';
import resourceItems from '/imports/content/Resource/client';
import content from '/imports/content/client';
import '/imports/client/ui/blocks/Resource/Single/ResourceSingle';
import '/imports/client/ui/blocks/Resource/Resource.styl';
import './ResourcePrice.html';
import './ResourcePrice.styl';

class ResourcePrice extends BlazeComponent {
  template() {
    return 'ResourcePrice';
  }
  constructor({
    hash: {
      price,
      time = null,
      timeLabel = '',
      artifacts = [],
      resources = [],
      isShowDiff = true,
      isStyleSmall = false,
      artifactsToResources = false,
      className,
    },
  }) {
    super();
    this.price = price;

    this.className = className;

    this.time = time;
    this.timeLabel = timeLabel;
    this.artifacts = artifacts;
    this.resources = resources;

    this.isShowDiff = isShowDiff;
    this.isStyleSmall = isStyleSmall;

    _.toPairs(price).forEach(([id, value]) => {
      if (!value) {
        return;
      }
      if (id === 'time') {
        this.time = value;
      } else if (Game.Artefacts.items[id]) {
        this.artifacts.push({
          obj: Game.Artefacts.items[id],
          value,
        });
      } else if (resourceItems[id]) {
        this.resources.push({
          obj: resourceItems[id],
          value,
        });
      } else if (content[id]) {
        this.resources.push({
          obj: content[id],
          value,
        });
      } else if (id === 'card') {
        this.resources.push({
          obj: Game.Cards.items.donate[Object.keys(value)[0]],
          value: value[Object.keys(value)[0]],
        });
      }
    });

    if (artifactsToResources || this.artifacts.length < 2) {
      this.resources.push(...this.artifacts);
      this.artifacts = [];
    } else {
      this.artifactsCount = this.artifacts.reduce(
        (total, artifact) => total + artifact.value,
        0,
      );
    }
  }

  availableResources(id, value) {
    return Game.Resources.getAvailable(id, value);
  }

  availableArtifacts() {
    return this.artifacts.reduce((total, artifact) => {
      const available = Game.Resources.getAvailable(artifact.obj.engName, artifact.value);
      return total + available;
    }, 0);
  }

  showCredits() {
    Game.Payment.showWindow();
  }

  showArtifactTooltip(event) {
    const target = $(event.currentTarget);

    target.attr({
      'data-tooltip': (new ResourcePrice({
        hash: {
          artifacts: this.artifacts,
          artifactsToResources: true,
        },
      }).renderComponentToHTML()),
      'data-tooltip-trigger': 'click',
      'data-tooltip-direction': 's',
    });
  }

  showTooltip(event, name, price) {
    const target = $(event.currentTarget);
    const tooltip = priceTooltip(price, name);
    target.attr({
      'data-tooltip': tooltip['data-tooltip'],
      'data-tooltip-direction': 'n',
    });
  }
}

ResourcePrice.register('ResourcePrice');

export default ResourcePrice;
