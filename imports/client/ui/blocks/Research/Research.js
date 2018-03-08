import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { Notifications } from '/moduls/game/lib/importCompability';
import { ReactiveVar } from 'meteor/reactive-var';
import Game from '/moduls/game/lib/main.game';
import Maximum from '/imports/client/ui/blocks/Maximum/Maximum';
import SpeedUp from '/imports/client/ui/blocks/SpeedUp/SpeedUp';
import '/imports/client/ui/blocks/Effect/Effect';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import '/imports/client/ui/blocks/Requirements/Requirements';
import '/imports/client/ui/button/button.styl';
import './Research.html';
import './Research.styl';

class Research extends BlazeComponent {
  template() {
    return 'Research';
  }

  onRendered() {
    $('.scrollbar-inner').perfectScrollbar('update');
  }

  Build() {
    const item = this.data().research;
    Meteor.call(
      'research.start',
      {
        id: item.id,
        level: this.data().level.get(),
      },
      function(error) {
        if (error) {
          Notifications.error('Невозможно начать исследование', error.error);
        } else {
          Notifications.success('Исследование запущено');
        }
      },
    );
    if (item.getCurrentLevel() === 0) {
      Router.go(item.url({ group: item.group }));
    }
  }

  toggleDescription() {
    const options = Meteor.user().settings && Meteor.user().settings.options;
    $(this.find('.cw--Research__info')).slideToggle(function() {
      Meteor.call(
        'settings.setOption',
        'hideDescription',
        !(options && options.hideDescription),
      );
    });
  }

  setMaximum() {
    if (Game.hasPremium()) {
      const item = this.data().research;
      let currentLevel = item.getCurrentLevel() + 1;

      while ((currentLevel + 1) <= item.maxLevel && item.canBuild(currentLevel + 1)) {
        currentLevel += 1;
      }

      this.data().level.set(currentLevel);
    } else {
      Game.Popup.show({
        template: Maximum.renderComponent(),
      });
    }
  }

  showSpeedUp() {
    Game.Popup.show({
      template: SpeedUp.renderComponent(),
      data: { item: this.data().research },
    });
  }

  getRequirements() {
    return this.data().research.getRequirements({ level: this.data().level.get() });
  }
}

Research.register('Research');

export default Research;
