import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ReactiveVar } from 'meteor/reactive-var';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Notifications } from '/moduls/game/lib/importCompability';
import content from '/imports/content/client';
import helpers from '/imports/lib/ui/helpers';
import '/imports/client/ui/Input/Number/InputNumber';
import '/imports/client/ui/Container/RewardRoller/ContainerRewardRoller';
import './ContainerRewardOpener.html';
import './ContainerRewardOpener.styl';

class ContainerRewardOpener extends BlazeComponent {
  template() {
    return 'ContainerRewardOpener';
  }

  onCreated() {
    super.onCreated();

    this.container = this.data('container');
    this.winner = new ReactiveVar(null);
    this.count = new ReactiveVar(this.container.getCount());
    this.opened = new ReactiveVar(0);
    this.isLoading = new ReactiveVar(false);

    this.countToBuy = new ReactiveVar(1);
    this.countToOpen = new ReactiveVar(1);

    // авто открыть
    this.autoOpen = new ReactiveVar(false);
    // авто некст
    this.autoGet = new ReactiveVar(false);

    this.interval = Meteor.setInterval(() => {
      if (!this.isLoading.get()) {
        if (this.winner.get()) {
          if (this.autoGet.get()) {
            this.get();
          }
        } else if (this.autoOpen.get() && this.container.has()) {
          this.open(); // open
        }
      }
    }, 1000);
  }

  onDestroyed() {
    super.onDestroyed();

    Meteor.clearInterval(this.interval);
  }

  reset() {
    this.winner.set(null);
    this.count.set(this.container.getCount());
    this.opened.set(0);
  }

  rewards() {
    const winner = this.winner.get();
    const winnerIds = (winner && _(winner).keys()) || [];
    return _(this.container.drop).map((reward) => {
      const id = _(reward.profit).keys()[0];
      const isWinner = winnerIds.includes(_(reward.profit).keys()[0]);
      return {
        isWinner,
        obj: content[id],
        count: helpers.formatNumber(isWinner ? winner[id] : reward.profit[id]),
        chance: helpers.formatNumber(reward.chance),
      };
    });
  }

  open() {
    this.isLoading.set(true);
    Meteor.call(
      'Building/Residential/SpacePort.openContainer',
      { id: this.container.id, count: this.countToOpen.get() },
      (error, winner) => {
        this.isLoading.set(false);
        if (error) {
          Notifications.error('Не удалось открыть контейнер', error.error);
        } else {
          this.winner.set(winner);
          this.opened.set(this.opened.get() + this.countToOpen.get());
        }
      },
    );
  }

  buy() {
    this.isLoading.set(true);
    this.container.buy({
      count: this.countToBuy.get(),
      onSuccess: () => {
        this.isLoading.set(false);
        this.reset();
      },
    });
  }

  get() {
    this.winner.set(null);
  }

  switchAutoOpen() {
    this.autoOpen.set(!this.autoOpen.get());
  }

  switchAutoGet() {
    this.autoGet.set(!this.autoGet.get());
  }

  getPrice(count) {
    return this.container.getPrice({ count });
  }
}

ContainerRewardOpener.register('ContainerRewardOpener');

export default ContainerRewardOpener;
