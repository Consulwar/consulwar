initPaymentClient = function() {
'use strict';
  
initPaymentLib();

// ----------------------------------------------------------------------------
// Payment modal window
// ----------------------------------------------------------------------------

var canShowReward = false;
var isPaymentSuccess = false;

var showPaymentWindow = function() {
  Game.Popup.show({ templateName: 'payment' });
  canShowReward = true;
};

var showPlatboxWindow = function(url) {
  if (url) {
    isPaymentSuccess = false;
    Game.Popup.show({ templateName: 'paymentPlatbox', data: { url } });
  }
};

var showTekoWindow = function(url) {
  if (url) {
    isPaymentSuccess = false;
    Game.Popup.show({ templateName: 'paymentTeko', data: { url } });
  }
};

var showRewardWindow = function(itemId) {
  var item = Game.Payment.items[itemId];
  if (item) {
    Game.Popup.show({ templateName: 'paymentReward', data: { item } });
  }
};

Game.Payment.showWindow = function() {
  showPaymentWindow();
};

Game.Payment.buyItem = function(item) {
  Meteor.call('teko.getPaymentUrl', item, function(err, url) {
    if (err) {
      Notifications.error(err.error);
    } else {
      showTekoWindow(url);
    }
  });
};

Template.payment.onRendered(function() {
  $('.payment.scrollbar-inner').perfectScrollbar();
});

Template.payment.helpers({
  paymentItems: function() {
    return _.filter(_.map(Game.Payment.items, function(item) {
      return item;
    }), function(item) {
      return item.profit.resources !== undefined;
    });
  }
});

Template.payment.events({
  'click .paymentItems .greenButton': function(e, t) {
    Game.Payment.buyItem(e.currentTarget.dataset.id);
  }
});

Template.paymentReward.events({
  'click .take': function(e, t) {
    Blaze.remove(t.view);
  }
});

Meteor.subscribe('paymentIncome');

Game.Payment.Income.Collection.find({}).observeChanges({
  added: function(id, fields) {
    if (canShowReward
     && fields
     && fields.source
     && fields.source.type == 'payment'
    ) {
      showRewardWindow(fields.source.item);
    }
  }
});

// ----------------------------------------------------------------------------
// Payment side menu
// ----------------------------------------------------------------------------

Template.paymentSide.events({
  'click .buy': function(e, t) {
    Game.Payment.showWindow();
  },
});

// ----------------------------------------------------------------------------
// Payment history
// ----------------------------------------------------------------------------

var isLoading = new ReactiveVar(false);
var history = new ReactiveVar(null);
var historyCurrentPage = null;
var historyCurrentType = null;

Game.Payment.showHistory = function() {
  var type = Router.current().getParams().type;
  var page = parseInt( Router.current().getParams().page, 10 );
  var count = 20;
  var isIncome = (type  == 'income') ? true : false;

  if (page == historyCurrentPage && type == historyCurrentType) {
    return; // Fucking Iron router! Prevent calling this action two times!
  }

  if (page && page > 0) {
    historyCurrentType = type;
    historyCurrentPage = page;

    history.set(null);
    isLoading.set(true);

    var methodName = isIncome ? 'user.getPaymentIncomeHistory' : 'user.getPaymentExpenseHistory';

    Meteor.call(methodName, page, count, function(err, data) {
      isLoading.set(false);
      if (err) {
        Notifications.error('Не удалось загрузить историю', err.error);
      } else {
        history.set(data);
      }
    });

    this.render('paymentHistory', {
      to: 'content',
      data: {
        count: count,
        isIncome: isIncome
      }
    });
  }
};

Template.paymentHistory.onDestroyed(function() {
  historyCurrentPage = null;
  historyCurrentType = null;
});

Template.paymentHistory.helpers({
  isIncome: function() { return this.isIncome; },

  count: function() { return this.count; },
  countTotal: function() {
    return this.isIncome
      ? Game.Statistic.getUserValue('payment.income')
      : Game.Statistic.getUserValue('payment.expense');
  },

  isLoading: function() { return isLoading.get(); },
  history: function() { return history.get(); },
});

};