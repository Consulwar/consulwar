import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './PaymentProcessing.html';
import './PaymentProcessing.styl';

class PaymentProcessing extends BlazeComponent {
  template() {
    return 'PaymentProcessing';
  }

  constructor({
    hash: {
      name,
      url,
    },
  }) {
    super();
    this.name = name;
    this.url = url;
  }
}

PaymentProcessing.register('PaymentProcessing');

export default PaymentProcessing;
