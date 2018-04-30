import helpers from '/imports/client/ui/helpers';
import unitItems from '/imports/content/Unit/client';
import resourceItems from '/imports/content/Resource/client';
import allContainers from '/imports/content/Container/Fleet/client';

UI.registerHelper('isNewLayout', function() {
  const newLayoutGroups = {
    planet: {
      Residential: true,
      Military: true,
    },
    research: {
      Evolution: true,
      Fleet: true,
    },
    cosmos: true,
    army: {
      Space: true,
      Ground: true,
      Infantry: true,
      Enginery: true,
      Air: true,
      Defense: true,
    },
    artefacts: true,
    house: true,
    info: true,
  };

  return (
       newLayoutGroups[Router.current().group] === true
    || (   newLayoutGroups[Router.current().group] 
      && newLayoutGroups[Router.current().group][Router.current().params.group] === true
      )
  );
});

UI.registerHelper('user', function() {
  return Meteor.user();
});

UI.registerHelper('options', function() {
  var user = Meteor.user();
  return user && user.settings && user.settings.options;
});

UI.registerHelper('Game', function() {
  return Game;
});

UI.registerHelper('serverTime', function() {
  return Session.get('serverTime');
});

UI.registerHelper('backToGroupLink', function() {
  return Router.current().route.path({
    group: Router.current().params.group
  });
});

UI.registerHelper('menuGroup', function() {
  return Router.current().group;
});

UI.registerHelper('itemGroup', function() {
  return Router.current().params.group;
});

UI.registerHelper('currentRouteName', function() {
  return Router.current().route.name;
});

UI.registerHelper('hasPremium', Game.hasPremium);


UI.registerHelper('battleCountNumber', function(name) {
  var count = game.Battle.countNumber[name];

  if (count) {
    return count.min + ' - ' + count.max;
  } else {
    return '';
  }
});

UI.registerHelper('eq', function(a, b) {
  return _.isEqual(a, b);
});

UI.registerHelper('and', function(a, b) {
  return a && b;
});

UI.registerHelper('or', function(a, b) {
  return a || b;
});

UI.registerHelper('eqandtrue', function(a, b) {
  return a && b && a === b;
});

UI.registerHelper('eqor', function(text, a, b) {
  return text == a || text == b;
});

UI.registerHelper('gt', function(a, b) {
  return a > b;
});

UI.registerHelper('gte', function(a, b) {
  return a >= b;
});

UI.registerHelper('lt', function(a, b) {
  return a < b;
});

UI.registerHelper('lte', function(a, b) {
  return a <= b;
});

UI.registerHelper('multiply', function(a, b) {
  return Math.floor(a * b);
});

UI.registerHelper('div', function(a, b) {
  return Math.floor(a / b);
});

UI.registerHelper('sum', function(a, b) {
  return a + b;
});

UI.registerHelper('abs', function(number) {
  return Math.abs(number);
});

UI.registerHelper('substract', function(a, b) {
  return a - b;
});

UI.registerHelper('nl2br', function(text) {
  return text.replace(/\n/g, '<br/>');
});

UI.registerHelper('not', function(value) {
  return !value;
});

UI.registerHelper('even', function(index) {
  return ((index + 1) % 2) === 0;
});

UI.registerHelper('toArray', function(obj) {
  return _.toArray(obj);
});

UI.registerHelper('arrayify',function(obj){
  return _.map(obj, function(value, key) {
    return {
      key,
      value
    };
  });
});

UI.registerHelper('makeArray', function() {
  return _.toArray(arguments).slice(0, -1);
});

UI.registerHelper('makeObject', function() {
  return arguments[0].hash;
});

UI.registerHelper('lookup', function(obj) {
  var result = obj;
  for(var i = 1; i < (arguments.length - 1); i++) {
    if (!_.isObject(result)) {
      return undefined;
    }
    result = result[arguments[i]];
  }
  return _.isFunction(result) ? result() : result;
});

UI.registerHelper('declension', helpers.declension);

UI.registerHelper('formatYearMonthDay', function(dateString) {
  var date = new Date(dateString);
  var day = date.getDate();
  day = (day < 10) ? '0' + day : day;
  var month = date.getMonth() + 1;
  month = (month < 10) ? '0' + month : month;
  return day + "." + month + "." + date.getFullYear();
}); 

UI.registerHelper('isToday', function(timestamp) {
  var inputDate = new Date(timestamp * 1000);
  var todaysDate = new Date(Game.getCurrentServerTime() * 1000);
  return inputDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0);
});

UI.registerHelper('formatDate', Game.Helpers.formatDate);
UI.registerHelper('formatHours', Game.Helpers.formatHours);
UI.registerHelper('formatSeconds', Game.Helpers.formatSeconds);
UI.registerHelper('formatTime', Game.Helpers.formatTime);
UI.registerHelper('getNumeralEnding', Game.Helpers.getNumeralEnding);

UI.registerHelper('formatProfit', function(profit) {
  if (profit == 'random') {
    return 'Случайная награда';
  }

  var result = '';
  for (var type in profit) {
    switch (type) {
      case 'resources':
        for (var resName in profit[type]) {
          if(resName === 'credits') {
            result += `<div class="cw--color_credit">
                         +${parseInt(profit[type][resName], 10)} ГГК
                       </div>`;
          } else {
            result += `<div>
                        ${resourceItems[resName].title}:
                        ${parseInt(profit[type][resName], 10)}
                      </div>`;
          }
        }
        break;
      case 'units':
        _(profit.units).pairs().forEach(([id, count]) => {
          result += `${unitItems[id].title}: ${parseInt(count, 10)}`;
        });
        break;
      case 'cards':
        for (var cardId in profit[type]) {
          var card = Game.Cards.getItem(cardId);
          if (card) {
            result += card.name + ': ';
            result += parseInt(profit[type][cardId], 10) + ' ';
          }
        }
        break;
      case 'houseItems':
        for (var houseItemGroup in profit[type]) {
          for (var houseItemName in profit[type][houseItemGroup]) {
            result += Game.House.items[houseItemGroup][houseItemName].name + ': ';
            result += parseInt(profit[type][houseItemGroup][houseItemName], 10) + ' ';
          }
        }
        break;
      case 'containers':
        _(profit[type]).pairs().forEach(([id, count]) => {
          result += `${allContainers[id].title}: ${count} `;
        });
        break;
      case 'votePower':
        result += 'Сила голоса: +' + parseInt(profit[type], 10) + ' ';
        break;
      case 'personSkin':
        _(profit[type]).pairs().forEach(([personId, skins]) => {
          skins.forEach((skinId) => {
            result += `Скин персонажа ${Game.Person[personId]}: ${skinId} `;
          });
        });
        break;
    }
  }
  return result;
});

var iso = {
  0: '',
  1: 'K',
  2: 'M',
  3: 'G',
  4: 'T',
  5: 'P',
  6: 'E',
  7: 'Z',
  8: 'Y'
};

UI.registerHelper('formatNumberWithISO', (number, limit) => (
  _.isNumber(limit)
    ? helpers.formatNumberWithIso(number, limit)
    : helpers.formatNumberWithIso(number)
));

UI.registerHelper('formatNumber', (number, delimeter) => (
  _.isString(delimeter)
    ? helpers.formatNumber(number, delimeter)
    : helpers.formatNumber(number)
));

const getEffectsTooltip = function({
  obj,
  target,
  effectsByPriority = [],
  invert = false,
  side = 's',
  isShowCurrent,
}) {
  if (obj.base === undefined) {
    return 'disabled';
  }

  const formatValue = function(value) {
    if (target === 'time') {
      return Game.Helpers.formatSeconds(value);
    }

    return helpers.formatNumber(value, ' - ');
  };

  let baseValue = obj.base[target];
  if (target === 'damage') {
    baseValue = obj.base.weapon.damage;
  } else if (target === 'life') {
    baseValue = obj.base.health.armor;
  } else {
    baseValue = obj.base[target];
  }

  const isMultiValue = !!(_.isObject(baseValue) || _.isArray(baseValue));

  // {
  //   sign, // + / -
  //   negative, // Boolean
  //   value,
  //   percent, // optional
  //   source, // String
  // }
  const effectsValues = [];

  if (isMultiValue || baseValue > 0) {
    effectsValues.push({ initial: formatValue(baseValue) });
  }

  const modifier = invert ? -1 : 1;

  let totalValue = _.clone(baseValue);

  _(effectsByPriority).pairs().forEach(([priority, effects]) => {
    if (!effects[target]) {
      return;
    }

    let sumEffect = 0;
    effects[target].forEach((effect) => {
      sumEffect += effect.value;

      const result = {};

      if ((effect.value > 0 && !invert) || (effect.value < 0 && invert)) {
        result.sign = '+';
        result.negative = invert;
      } else {
        result.sign = '–';
        result.negative = !invert;
      }

      result.source = effect.provider.name || effect.provider.title;

      if (priority % 2 === 1) {
        result.value = formatValue(Math.abs(effect.value));
      } else if (target === 'time') {
        result.percent = Math.abs(effect.value);
        const resultedValue = (Math.abs(effect.value) + 100) * 0.01;

        if ((invert && effect.value >= 0) || (!invert && effect.value < 0)) {
          result.value = formatValue(Math.ceil(totalValue - (totalValue / resultedValue)));
        } else {
          result.value = formatValue(totalValue - (Math.ceil(totalValue * resultedValue)));
        }
      } else {
        result.percent = Math.abs(effect.value);
        if (isMultiValue) {
          result.value = _(_.mapObject(totalValue, value => (
            Math.abs(Math.floor(value * (effect.value * 0.01)))
          )))
            .toArray()
            .join(' - ');
        } else {
          result.value = formatValue(
            Math.abs(Math.floor(totalValue * (effect.value * 0.01))),
          );
        }
      }

      effectsValues.push(result);
    });

    if (priority % 2 === 1) {
      if (isMultiValue) {
        totalValue = _.mapObject(totalValue, value => value + (sumEffect * modifier));
      } else {
        totalValue += sumEffect * modifier;
      }
    } else if (target === 'time') {
      const resultedValue = (Math.abs(sumEffect) + 100) * 0.01;

      if ((invert && sumEffect >= 0) || (!invert && sumEffect < 0)) {
        totalValue = Math.ceil(totalValue / resultedValue);
      } else {
        totalValue = Math.ceil(totalValue * resultedValue);
      }
    } else if (isMultiValue) {
      totalValue = _.mapObject(totalValue, value => (
        value + (value * sumEffect * 0.01 * modifier)
      ));
    } else {
      totalValue += Math.floor(totalValue * (sumEffect * 0.01)) * modifier;
    }

    effectsValues.push({ total: formatValue(totalValue) });
  });

  if (effectsValues.length && effectsValues[effectsValues.length - 1].total) {
    effectsValues[effectsValues.length - 1].final = true;
  }

  return {
    'data-tooltip': Blaze.toHTMLWithData(Template.tooltipTable, {
      isShowCurrent,
      target,
      price: invert ? obj[target] : null,
      values: effectsValues,
    }),
    'data-tooltip-direction': side,
  };
}

Tracker.autorun(function() {
  var currentTooltip = Tooltips.get();
  var changed = false;

  var width = $('.tooltip').width();
  if (currentTooltip.css.left < 0) {
    currentTooltip.css.left = 0;
    changed = true;
  } else if (currentTooltip.css.left + width > (document.body.clientWidth - 40)) {
    currentTooltip.css.left = document.body.clientWidth - width - 40;
    changed = true;
  }


  var height = $('.tooltip').height();
  if (currentTooltip.css.top < 0) {
    currentTooltip.css.top = 0;
    changed = true;
  } else if (currentTooltip.css.top + height > (document.body.clientHeight - 40)) {
    currentTooltip.css.top = document.body.clientHeight - height - 40;
    changed = true;
  }

  if (changed) {
    Tooltips.setPosition(currentTooltip.css);
  }
});

const priceTooltip = function (price, target) {
  return getEffectsTooltip({
    obj: price,
    target,
    effectsByPriority: price.effects,
    invert: true,
    side: 'n',
    isShowCurrent: true,
  });
};
UI.registerHelper('priceTooltip', priceTooltip);

const incomeTooltip = function(effects, target) {
  var income = {base: {}};
  income.base[target] = 0;
  return getEffectsTooltip({
    obj: income,
    target,
    effectsByPriority: effects,
    invert: false,
    side: 's',
    isShowCurrent: true,
  });
}
UI.registerHelper('incomeTooltip', incomeTooltip);

const militaryTooltip = function(characteristics, target) {
  return getEffectsTooltip({
    obj: characteristics,
    target,
    effectsByPriority: characteristics.effects,
    invert: false,
    side: 'w',
    isShowCurrent: false,
  });
};
UI.registerHelper('militaryTooltip', militaryTooltip);

Template.tooltipTable.helpers({
  current: function() {
    if (this.target == 'time' || !this.isShowCurrent) {
      return null;
    }
    
    var userResources = Game.Resources.currentValue.get();
    var current = userResources[this.target] ? userResources[this.target].amount : 0;

    return (!this.price || current < this.price) ? current : null;
  },

  time: function() {
    if (!this.price || this.target == 'time' || !this.isShowCurrent) {
      return null;
    }

    var income = Game.Resources.getIncome()[this.target];
    if (!income) {
      return null;
    }
    
    var userResources = Game.Resources.currentValue.get();
    var current = userResources[this.target] ? userResources[this.target].amount : 0;

    if (current >= this.price) {
      return null;
    }

    return Math.round((this.price - current) / income * 3600);
  }
});

export {
  priceTooltip,
  incomeTooltip,
  militaryTooltip,
};
