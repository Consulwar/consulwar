initUnitClient = function() {
'use strict';

initUnitLib();
initSquadLib();

Meteor.subscribe('squad');

Game.Unit.showPage = function() {
  var item = Game.Unit.items[this.group][this.params.group][this.params.item];
  
  if (item) {
    this.render('unit', {
      to: 'content', 
      data: {
        unit: item,
        count: new ReactiveVar(1)
      }
    });
  } else {
    this.render('empty', {to: 'content'});
  }
};

Game.Unit.showReptilePage = function() {
  var item = Game.Unit.items.reptiles[this.params.group][this.params.item];
  
  if (item) {
    this.render('unit', {
      to: 'content', 
      data: {
        unit: item,
        count: new ReactiveVar(1)
      }
    });
  } else {
    this.render('empty', {to: 'content'});
  }
};

Template.unit.helpers({
  count: function() {
    return this.count.get();
  }
});

Template.unit.onRendered(function() {
  $('.content .scrollbar-inner').perfectScrollbar();
});

Template.unitCharacteristics.events({
  'mouseover .characteristics > div > div[data-tooltip]': function(e, t) {
    let target = $(e.currentTarget);
    let currentCharachteristic = target.parent().attr('class') == 'weapon' ? 'damage' : 'life';
    let tooltip = Blaze._globalHelpers.militaryTooltip(
      this.unit.characteristics, 
      currentCharachteristic
    )
    target.attr('data-tooltip', tooltip['data-tooltip']);
  },
  'mouseover .targets > li': function(e, t) {
    $(e.currentTarget).attr('data-tooltip', Blaze.toHTMLWithData(
      Template.unitCharacteristics, 
      {
        unit: this,
        addTitle: true
      }
    ));
  }
});

// Из-за разницы в цене единицы и большого количества (из-за скидок) возникает погрешность
// и необходимость пересчитать дополнительно
var getMax = function(item, accumulator) {
  accumulator = accumulator || 0;
  var price = item.price();
  var alreadySpended = accumulator ? item.price(accumulator) : null;
  var avalialbeResources = Game.Resources.currentValue.get();

  var minAmount = Infinity;
  for (var res in price) {
    if (res == 'time') {
      continue;
    }
    let max = (avalialbeResources[res] 
      ? Math.floor(
        (avalialbeResources[res].amount - (accumulator ? alreadySpended[res] : 0)) / price[res]
        )
      : 0
    ) + accumulator;
    if (max < minAmount) {
      minAmount = max;
    }
  }

  if (minAmount == accumulator) {
    return accumulator;
  } else {
    return getMax(item, minAmount);
  }
};

Template.unit.events({
  'keyup .count, change .count': function(e, t) {
    var value = parseInt(e.target.value.replace(/\D/g,''), 10);
    value = value > 0 ? value : 1;
    if ( e.target.value.length > 0 || e.type == 'change' ) {
      e.target.value = value;
    }
    this.count.set(value);
  },

  'click button.max': function(e, t) {
    var item = t.data.unit;

    this.count.set(getMax(item));
  },

  'click button.build': function(e, t) {
    var item = t.data.unit;

    Meteor.call('unit.build', {
        group: item.group,
        engName: item.engName,
        count: this.count.get()
      },
      function(error, message) {
        if (error) {
          Notifications.error('Невозможно подготовить юнитов', error.error);
        } else {
          Notifications.success('Строительство юнитов запущено');
        }
      }
    );
  },
  
  'click .toggle_description': function(e, t) {
    $(t.find('.description')).slideToggle(function() {
      var options = Meteor.user().settings && Meteor.user().settings.options;
      Meteor.call('settings.setOption', 'hideDescription', !(options && options.hideDescription));
    });
  },

  'click .repair'(event, templateInstance) {
    Game.Wrecks.showPopup(templateInstance.data.unit);
  },
});

initUnitClientWrecks();

};