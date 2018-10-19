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

const subscription = Meteor.subscribe('paymentIncome');

Game.Payment.Income.Collection.find({}).observeChanges({
  added: function(id, fields) {
    if (fields
     && fields.source
     && fields.source.type == 'payment'
     && subscription.ready()
     && Meteor.user()
    ) {
      if (
        Meteor.settings.public.gameAnalytics
        && Meteor.settings.public.gameAnalytics.enabled
      ) {
        const gameanalytics = require('gameanalytics');
        let item = Game.Payment.items[fields.source.item];
        gameanalytics.GameAnalytics.addBusinessEvent('RUB', item.cost.rub * 100, 'credits', fields.source.item, window.location.pathname);
      }
      showRewardWindow(fields.source.item);
    }
  }
});

};