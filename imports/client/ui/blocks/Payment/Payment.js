import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import { _ } from 'lodash';
import PaymentHistory from './History/PaymentHistory';
import './Payment.html';
import './Payment.styl';

class Payment extends BlazeComponent {
  template() {
    return 'Payment';
  }

  paymentItems() {
    return _.filter(_.map(Game.Payment.items, function(item) {
      return item;
    }), function(item) {
      return item.profit.resources !== undefined;
    });
  }

  showHistory() {
    Game.Popup.show({ template: PaymentHistory.renderComponent() });
  }
}

Payment.register('Payment');

export default Payment;
