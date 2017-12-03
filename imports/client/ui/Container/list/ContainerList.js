import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import Game from '/moduls/game/lib/main.game';
import ContainerRewardOpener from '/imports/client/ui/Container/RewardOpener/ContainerRewardOpener';
import '/imports/client/ui/Input/Number/InputNumber';
import '../Card/ContainerCard';
import './ContainerList.html';
import './ContainerList.styl';

const showOpener = function(container) {
  Game.Popup.show({
    template: ContainerRewardOpener.renderComponent(),
    data: { container },
  });
};

class ContainerList extends BlazeComponent {
  template() {
    return 'ContainerList';
  }

  onCreated() {
    super.onCreated();

    this.containers = this.data('containers');
    this.countToBuy = new ReactiveVar(1);
  }

  getPrice(container) {
    return container.getPrice({ count: this.countToBuy.get() });
  }

  openContainer(event, container) {
    if (container.has()) {
      showOpener(container);
    } else {
      const count = this.countToBuy.get();

      container.buy({
        count,
        onSuccess: () => showOpener(container),
      });
    }
  }
}

ContainerList.register('ContainerList');

export default ContainerList;
