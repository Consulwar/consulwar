import { Meteor } from 'meteor/meteor';
import { Notifications } from '/moduls/game/lib/importCompability';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import './SpeedUp.html';
import './SpeedUp.styl';

class SpeedUp extends BlazeComponent {
  template() {
    return 'SpeedUp';
  }

  onCreated() {
    super.onCreated();
    this.autorun(() => {
      if (!this.data().item.getQueue()) {
        this.closeWindow();
      }
    });
    this.SpeedUpPrice = this.getPrice();
  }

  timeLeft() {
    return this.data().item.getQueue().finishTime - Game.getCurrentServerTime();
  }

  getPrice() {
    return Game.Queue.getSpeedupPrice(this.data().item, this.data().item.getQueue());
  }

  SpeedUp() {
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
  }

  closeWindow() {
    this.removeComponent();
  }
}

SpeedUp.register('SpeedUp');

export default SpeedUp;
