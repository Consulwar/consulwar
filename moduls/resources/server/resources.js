import Log from '/imports/modules/Log/server/Log';
import persons from '/imports/content/Person/server';
import allContainers from '/imports/content/Container/server';
import User from '/imports/modules/User/server/User';
import content from '/imports/content/server';

initResourcesServer = function() {
'use strict';

initResourcesLib();

Game.Resources.Collection._ensureIndex({
  user_id: 1
});

// Добавляет/вычитает ресурсы текущему пользователю
// invertSign - true если вычитаем ресурсы
Game.Resources.set = function(resource, invertSign, uid) {
  invertSign = invertSign === true ? -1 : 1;

  var inc = null;
  var set = null;

  for (var name in resource) {
    if (name == 'time') {
      continue;
    }

    // increment resource
    if (!inc) {
      inc = {};
    }

    var increment = (resource[name].amount !== undefined)
      ? resource[name].amount
      : resource[name];

    if (isNaN(increment) || (increment < 0 && invertSign)) {
      increment = 0;
    }

    inc[name + '.amount'] = parseInt(increment * invertSign);

    // set resource bonus seconds
    if (resource[name].leftover !== undefined) {
      if (!set) {
        set = {};
      }

      set[name + '.leftover'] = resource[name].leftover;
    }

    // set resource bonus
    if (resource[name].totalBonus !== undefined) {
      if (!set) {
        set = {};
      }

      set[name + '.bonus'] = resource[name].totalBonus;
    }
  }

  var update = null;
  
  if (inc || set) {
    update = {};
    if (set) {
      update.$set = set;
    }
    if (inc) {
      update.$inc = inc;
    }
  }

  if (update) {
    Game.Resources.Collection.update({
      user_id: uid !== undefined ? uid : Meteor.userId()
    }, update);
  }
};

Game.Resources.add = function(resource, uid) {
  Game.Resources.set(resource, false, uid);
  saveStatistic('resources.gained', resource, uid);
};

Game.Resources.spend = function(resource, uid) {
  Game.Resources.set(resource, true, uid);
  saveStatistic('resources.spent', resource, uid);
};

Game.Resources.steal = function(resource, uid) {
  Game.Resources.set(resource, true, uid);
  saveStatistic('resources.stolen', resource, uid);
};

Game.Resources.sold = function(resource, uid) {
  Game.Resources.set(resource, true, uid);
  saveStatistic('resources.sold', resource, uid);
  saveStatistic('resources.spent', resource, uid);
};

Game.Resources.bought = function(resource, uid) {
  Game.Resources.set(resource, false, uid);
  saveStatistic('resources.bought', resource, uid);
  saveStatistic('resources.gained', resource, uid);
};

var saveStatistic = function(field, resources, uid) {
  var increment = {};
  increment[field + '.total'] = 0;

  for (var key in resources) {
    if (key == 'time') {
      continue;
    }

    var amount = (resources[key].amount !== undefined)
      ? parseInt( resources[key].amount )
      : parseInt( resources[key] );

    increment[field + '.' + key] = amount;
    increment[field + '.total'] += amount;
  }
  
  if (increment[field + '.total'] > 0) {
    Game.Statistic.incrementUser(uid !== undefined ? uid : Meteor.userId(), increment);
  }
};

let rollRandomValues = function(object) {
  let copyObject = {};

  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      let value = object[key];
      if (_.isArray(value)) {
        copyObject[key] = Game.Random.interval( value[0], value[1] );
      } else if (_.isObject(value)) {
        copyObject[key] = rollRandomValues(value);
      } else {
        copyObject[key] = value;
      }
    }
  }

  return copyObject;
};

Game.Resources.rollProfit = function(drop) {
  var max = 0;
  var i = 0;
  for (i = 0; i < drop.length; i++) {
    max += drop[i].chance;
  }

  var rand = Game.Random.random() * max;
  var val = 0;

  for (i = 0; i < drop.length; i++) {
    val += drop[i].chance;
    if (rand <= val) {
      break;
    }
  }

  return rollRandomValues( drop[i].profit );
};

Game.Resources.addProfit = function(profit, uid = Meteor.userId()) {
  // new !
  _(profit)
    .pairs()
    .filter(([id]) => id.indexOf('/') !== -1)
    .forEach(([id, count]) => {
      content[id].add({ count, userId: uid });
    });
  //

  if (profit.resources) {
    Game.Resources.add(profit.resources, uid);
  }

  if (profit.units) {
    var units = profit.units;

    _(units).pairs().forEach(([id, count]) => content[id].add({
      count: parseInt(count, 10),
      userId: uid,
    }));
  }

  if (profit.votePower) {
    Meteor.users.update({
      _id: uid,
    }, {
      $inc: { votePowerBonus: profit.votePower },
    });
  }

  if (profit.cards) {
    Game.Cards.add(profit.cards, uid);
  }

  if (profit.containers) {
    _(profit.containers).pairs().forEach(([id, count]) => {
      allContainers[id].add({ count, userId: uid });
    });
  }

  if (profit.houseItems) {
    for (var itemGroup in profit.houseItems) {
      for (var itemName in profit.houseItems[itemGroup]) {
        Game.House.add(itemGroup, itemName, uid);
      }
    }
  }

  if (profit.personSkin) {
    _(profit.personSkin).pairs().forEach(([personId, skins]) => {
      _(skins).keys().forEach((skinId) => {
        persons[personId].addSkin({
          userId: uid,
          id: skinId,
        });
      });
    });
  }
};

Game.Resources.updateWithIncome = function(currentTime) {
  var resources = Game.Resources.getValue();

  if (currentTime < resources.updated - 10) {
    throw new Meteor.Error('Ошибка при расчёте доходов', 'Подождите 5 минут');
  }

  var delta = currentTime - resources.updated;
  if (delta < 1) {
    return true;
  }

  var income = Game.Resources.getIncome({ timestamp: currentTime });

  Game.Resources.Collection.update({
    user_id: Meteor.userId()
  }, {
    $set: {
      updated: currentTime
    }
  });

  // fix values if NaN
  var fixedSet = {};

  if (isNaN(resources.humans.amount)) {
    fixedSet['humans.amount'] = 0;
  }
  if (isNaN(resources.metals.amount)) {
    fixedSet['metals.amount'] = 0;
  }
  if (isNaN(resources.crystals.amount)) {
    fixedSet['crystals.amount'] = 0;
  }
  if (isNaN(resources.honor.amount)) {
    fixedSet['honor.amount'] = 0;
  }
  if (isNaN(resources.credits.amount)) {
    fixedSet['credits.amount'] = 0;
  }

  if (_.keys(fixedSet).length > 0) {
    console.log('User ' + Meteor.userId() + ' got NaN resource value!', _.keys(fixedSet));
    Game.Resources.Collection.update({
      user_id: Meteor.userId()
    }, {
      $set: fixedSet
    });
  }

  // calculate income
  var result = {
    humans: Game.Resources.calculateProduction(
      income.humans, 
      delta,
      resources.humans.leftover
    ),
    crystals: Game.Resources.calculateProduction(
      income.crystals, 
      delta,
      resources.crystals.leftover,
      true
    ),
    metals: Game.Resources.calculateProduction(
      income.metals, 
      delta,
      resources.metals.leftover,
      true
    ),
    honor: Game.Resources.calculateProduction(
      income.honor, 
      delta,
      resources.honor.leftover
    ),
    credits: Game.Resources.calculateProduction(
      income.credits, 
      delta,
      resources.credits.leftover
    )
  };

  for (var name in result) {
    // set resource bonus
    if (result[name].bonus !== undefined) {
      var currentBonus = (resources[name] && resources[name].bonus)
        ? resources[name].bonus
        : 0;

      result[name].totalBonus = Math.max(
        0,
        Math.min(
          currentBonus + result[name].bonus,
          (income[name] || 0) * Game.Resources.bonusStorage
        )
      );
    }
  }

  Game.Resources.add(result);
  return result;
};

Game.Resources.initialize = function(user) {
  user = user || Meteor.user();
  var currentValue = Game.Resources.getValue({ user });

  if (currentValue === undefined) {
    Game.Resources.Collection.insert({
      'user_id': user._id,
      humans: { amount: 5000 },
      metals: { amount: 12000 },
      crystals: { amount: 8000 },
      credits: { amount: 100 },
      honor: { amount: 0 },
      updated: Game.getCurrentTime()
    });
  }
};

Meteor.methods({
  'resources.buyCGC'(count) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'resources.buyCGC', user });

    if (
      !Meteor.settings.public.event
      || !Meteor.settings.public.event.projectSupport
      || !Meteor.settings.public.event.endTime
      || Meteor.settings.public.event.endTime < Date.now()
    ) {
      throw new Meteor.Error('Событие не активно');
    }

    check(count, Match.Integer);
    if (count < 1) {
      throw new Meteor.Error('Ты нас обокрасть решил? Не так ли?');
    }
    const price = { credits: 1000 * count };

    if(!Game.Resources.has({ resources: price, user })) {
      throw new Meteor.Error('Недостаточно ресурсов для покупки ЧГК');
    }

    const item = content['Resource/Artifact/Red/CleanCredit'];
    item.add({ count, userId: user._id });
    console.log(item);

    Game.Resources.spend(price, user._id);

    Game.Payment.Expense.log(price.credits, 'buyResource', {
      itemId: item.id,
      count,
    });

    const profit = {
      resources: {},
    };
    profit.resources[item.engName] = count;

    return profit;
  },
  getBonusResources: function(name) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'getBonusResources', user });

    if (name != 'crystals' && name != 'metals') {
      throw new Meteor.Error('А как тебе вариант, что сейчас у тебя обнулится весь рейтинг? Ха-ха');
    }

    Meteor.call('actualizeGameInfo');

    var currentValue = Game.Resources.getValue();
    var income = Game.Resources.getIncome();

    if (currentValue[name].bonus < Math.floor(income[name] / 4)) {
      throw new Meteor.Error('Слишком мало накопилось… подкопите ещё');
    }

    var set = {};
    set[name] = {
      amount: (currentValue[name].amount || 0) + currentValue[name].bonus,
      bonus: 0
    };

    Game.Resources.Collection.update({'user_id': Meteor.userId()}, {$set: set});

    return currentValue[name].bonus;
  }
});

Meteor.publish('resources', function () {
  if (this.userId) {
    return Game.Resources.Collection.find({user_id: this.userId});
  }
});

};