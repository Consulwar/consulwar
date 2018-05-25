import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { Notifications } from '/moduls/game/lib/importCompability';
import { $ } from 'meteor/jquery';
import RewardPopup from '/imports/client/ui/blocks/Reward/Popup/RewardPopup';
import Game from '/moduls/game/lib/main.game';
import './Sponsor.html';
import './Sponsor.styl';

class Sponsor extends BlazeComponent {
  template() {
    return 'Sponsor';
  }

  onCreated() {
    super.onCreated();

    this.count = new ReactiveVar(5);

    this.collected = new ReactiveVar(75000);
    this.needed = 200000;
  }

  onRendered() {
    super.onRendered();

    // $('.cw--Sponsor__scale').easyPieChart({
    //   size: 120,
    //   lineWidth: 8,
    //   barColor: '#56BAF2',
    //   trackColor: false,
    //   scaleColor: false,
    // });

    // this.autorun(() => {
    //   $('.cw--Sponsor__scale').data('easyPieChart').update(this.getPercent());
    // });
  }

  getPercent() {
    return (this.collected.get() / this.needed) * 100;
  }

  getCalculatedCredits() {
    return this.count.get() * 1000;
  }

  convert() {
    const count = this.count.get();
    Meteor.call(
      'resources.buyCGC',
      count,
      (error, reward) => {
        if (error) {
          Notifications.error('Не удалость произвести обмен', error.error);
        } else {
          Game.Popup.show({
            template: (new RewardPopup({
              hash: {
                reward,
              },
            })).renderComponent(),
            hideClose: true,
          });
        }
      },
    );
  }

  getTime() {
    return (Meteor.settings.public.event.endTime / 1000) - Game.getCurrentServerTime();
  }

  showCredits() {
    Game.Payment.showWindow();
  }
}

Sponsor.register('Sponsor');

export default Sponsor;
