import Payment from '/imports/client/ui/blocks/Payment/Payment';
import PaymentHistory from '/imports/client/ui/blocks/Payment/History/PaymentHistory';
import PaymentProcessing from '/imports/client/ui/blocks/Payment/Processing/PaymentProcessing';
import RewardPopup from '/imports/client/ui/blocks/Reward/Popup/RewardPopup';

initPaymentClient = function() {
'use strict';
  
initPaymentLib();

// ----------------------------------------------------------------------------
// Payment modal window
// ----------------------------------------------------------------------------

var showPlatboxWindow = function(url) {
  if (url) {
    isPaymentSuccess = false;
    Game.Popup.show({
      template: (new PaymentProcessing({
        hash: {
          url,
          name: 'platbox',
        }
      })).renderComponent(),
    });
  }
};

var showTekoWindow = function(url) {
  if (url) {
    Game.Popup.show({
      template: (new PaymentProcessing({
        hash: {
          url,
          name: 'teko',
        }
      })).renderComponent(),
    });
  }
};

var showRewardWindow = function(itemId) {
  var item = Game.Payment.items[itemId];
  if (item) {
    Game.Popup.show({
      template: (new RewardPopup({
        hash: {
          reward: item.profit,
          description: item.description,
        }
      })).renderComponent(),
      hideClose: true,
    });
  }
};

Game.Payment.showWindow = function() {
  Game.Popup.show({ template: Payment.renderComponent() });
};

Game.Payment.showHistory = function(type) {
  Game.Popup.show({
    template: (new PaymentHistory(type)).renderComponent()
  });
}

Game.Payment.buyItem = function(item) {
  Meteor.call('teko.getPaymentUrl', item, function(err, url) {
    if (err) {
      Notifications.error(err.error);
    } else {
      showTekoWindow(url);
    }
  });
};

const subscription = Meteor.subscribe('paymentIncome');

Game.Payment.Income.Collection.find({}).observeChanges({
  added: function(id, fields) {
    if (fields
     && fields.source
     && fields.source.type == 'payment'
     && subscription.ready()
     && Meteor.user()
    ) {
      showRewardWindow(fields.source.item);
    }
  }
});

};