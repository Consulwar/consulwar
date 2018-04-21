import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Notifications } from '/moduls/game/lib/importCompability';
import { ReactiveVar } from 'meteor/reactive-var';
import Game from '/moduls/game/lib/main.game';
import SoundManager from '/imports/client/ui/SoundManager/SoundManager';
import Maximum from '/imports/client/ui/blocks/Build/Maximum/BuildMaximum';
import SpeedUp from '/imports/client/ui/blocks/Build/SpeedUp/BuildSpeedUp';
import '/imports/client/ui/blocks/Effect/Levels/EffectLevels';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import '/imports/client/ui/blocks/Requirements/Requirements';
import '/imports/client/ui/button/button.styl';
import './BuildResearch.html';
import './BuildResearch.styl';

class BuildResearch extends BlazeComponent {
  template() {
    return 'BuildResearch';
  }

  constructor({
    hash: {
      research,
      level,
    },
  }) {
    super();
    this.research = research;
    this.level = level;
    this.timeLeft = new ReactiveVar(null);
  }

  onCreated() {
    super.onCreated();
    if (this.research.maxLevel < this.level.get()) {
      this.level.set(120);
    }
    this.autorun(() => {
      const queue = this.research.getQueue();
      if (queue) {
        this.timeLeft.set(queue.finishTime - Game.getCurrentServerTime());
      } else {
        this.timeLeft.set(null);
      }
    });
  }

  onRendered() {
    super.onRendered();
    $('.scrollbar-inner').perfectScrollbar('update');
  }

  build() {
    const item = this.research;
    Meteor.call(
      'research.start',
      {
        id: item.id,
        level: this.level.get(),
      },
      function(error) {
        if (error) {
          Notifications.error('Невозможно начать исследование', error.error);
        } else {
          Notifications.success('Исследование запущено');
          SoundManager.play('buildingStart');
        }
      },
    );
  }

  toggleDescription() {
    const options = Meteor.user().settings && Meteor.user().settings.options;
    $(this.find('.cw--BuildResearch__info')).slideToggle(function() {
      Meteor.call(
        'settings.setOption',
        'hideDescription',
        !(options && options.hideDescription),
      );
    });
  }

  setMaximum() {
    if (Game.hasPremium()) {
      let currentLevel = this.research.getCurrentLevel() + 1;
      while (
        (currentLevel + 1) <= this.research.maxLevel
        && this.research.canBuild(currentLevel + 1)
      ) {
        currentLevel += 1;
      }

      this.level.set(currentLevel);
    } else {
      Game.Popup.show({
        template: Maximum.renderComponent(),
      });
    }
  }

  showSpeedUp() {
    Game.Popup.show({
      template: SpeedUp.renderComponent(),
      data: { item: this.research },
    });
  }

  getRequirements() {
    return this.research.getRequirements({ level: this.level.get() });
  }
}

BuildResearch.register('BuildResearch');

export default BuildResearch;
