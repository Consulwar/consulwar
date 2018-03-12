import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { _ } from 'lodash';
import { priceTooltip } from '/moduls/game/client/helper';
import Game from '/moduls/game/lib/main.game';
import resourceItems from '/imports/content/Resource/client';
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
      artifacts = [],
      resources = [],
      isShowDiff = true,
      artifactsToResources = false,
      className,
    },
  }) {
    super();
    this.price = price;

    this.className = className;

    this.time = time;
    this.artifacts = artifacts;
    this.resources = resources;

    this.isShowDiff = isShowDiff;

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

    this.userResources = new ReactiveVar(Game.Resources.getValue());
  }

  onCreated() {
    super.onCreated();
    this.autorun(() => {
      this.userResources.set(Game.Resources.getValue());
    });
  }

  availableResources(id, value) {
    const resource = this.userResources.get()[id];
    let userHas = (resource && resource.amount) || 0;
    if (userHas > value) {
      userHas = value;
    }
    return userHas;
  }

  availableArtifacts() {
    const resource = this.userResources.get();
    return this.artifacts.reduce((total, artifact) => {
      let userHas = (resource[artifact.obj.engName] && resource[artifact.obj.engName].amount) || 0;
      if (userHas > artifact.value) {
        userHas = artifact.value;
      }
      return total + userHas;
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
