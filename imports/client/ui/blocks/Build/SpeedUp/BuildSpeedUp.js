import { Meteor } from 'meteor/meteor';
import { Notifications } from '/moduls/game/lib/importCompability';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import './BuildSpeedUp.html';
import './BuildSpeedUp.styl';

class BuildSpeedUp extends BlazeComponent {
  template() {
    return 'BuildSpeedUp';
  }

  onCreated() {
    super.onCreated();
    this.autorun(() => {
      if (!this.data().item.getQueue()) {
        this.closeWindow();
      }
    });
  }

  timeLeft() {
    return this.data().item.getQueue().finishTime - Game.getCurrentServerTime();
  }

  getPrice() {
    return Game.Queue.getSpeedupPrice(this.data().item, this.data().item.getQueue());
  }

  speedUp() {
    if (Game.Resources.has({
      resources: this.getPrice(),
    })) {
      Meteor.call(
        `${this.data().item.type}.speedup`,
        {
          id: this.data().item.id,
        },
        (error) => {
          if (error) {
            Notifications.error('Невозможно ускорить', error.error);
          } else {
            this.closeWindow();
            Notifications.success('Ускорение запущено');
          }
        },
      );
    } else {
      Game.Payment.showWindow();
    }
  }

  closeWindow() {
    this.removeComponent();
  }
}

BuildSpeedUp.register('BuildSpeedUp');

export default BuildSpeedUp;
