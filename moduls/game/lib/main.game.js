game = {
  PRODUCTION_FACTOR: 1.48902803168182,
  PRICE_FACTOR: 1.1,

  planet: {
    residential: {}, 
    counsul: {}, 
    military: {}
  },
  army: {
    fleet: {},
    heroes: {},
    ground: {}
  },
  research: {
    evolution: {},
    fleetups: {},
    mutual: {}
  },
  powerups: {
    avaliable: {},
    activated: {},
    bought: {}
  },
  alliance: {
    info: {},
    find: {},
    create: {}
  },
  battle: {
    reptiles: {},
    reinforcement: {},
    statistics: {},
    earth: {}
  },
  /*battle: {
    events: {},
    reinforcement: {},
    history: {}
  },*/
  messages: {
    'private': {},
    alliance: {},
    all: {}
  },
  reptiles: {
    rfleet: {},
    rheroes: {},
    rground: {}
  },

  setToMenu: '',
  setToSide: '',

  hasArmy: function() {
    var army = Game.Unit.getValue();

    if (army && army.ground) {

      for (var name in army.ground) {
        if (army.ground[name] > 0) {
          return true;
        }
      }
    }
    return false;
  },

  hasFleet: function() {
    var army = Game.Unit.getValue();

    if (army && army.fleet) {

      for (var name in army.fleet) {
        if (army.fleet[name] > 0) {
          return true;
        }
      }
    }
    return false;
  }
};

var itemCurrentOrder = 0;

game.Item = function(options) {
  this.constructor = function(options) {
    var self = this;

    this.order = itemCurrentOrder;
    itemCurrentOrder++;

    this.name = options.name;
    this.engName = options.engName;

    if (options.effect) {
      if (!_.isArray(options.effect)) {
        options.effect = [options.effect];
      }

      for (var i = 0; i < options.effect.length; i++) {
        if (options.effect[i].register) {
          if (!this.doNotRegisterEffect) {
            options.effect[i].register(this);
          } else {
            options.effect[i].setProvider(this);
          }
        }
      }
    } 

    this.effect = options.effect;
    if (options.effect && options.effect.result) {
      this.effect.result = options.effect.result.bind(this);
    }
    this.description = options.description;
    this.basePrice = options.basePrice;
    this.maxLevel = options.maxLevel;

    this.overlay = options.overlay;

    this.notImplemented = options.notImplemented;

    //this.requirements = options.requirements;
    Object.defineProperty(this, 'requirements', {
      get: function() {
        return typeof options.requirements == 'function' ? options.requirements.call(self) : [];
      },
      enumerable: true
    });

    if (options.targets) {
      //this.targets = options.targets;
      Object.defineProperty(this, 'targets', {
        get: function() {
          //var characteristics = Game.Effect.Military.applyTo(this, options.characteristics, false);
          //characteristics.base = options.characteristics;

          return options.targets;
        },
        enumerable: true
      });
    }
    
    if (options.characteristics) {
      //todo remove after set correct values in content
      if (!options.characteristics.weapon) {
        let characteristics = options.characteristics;

        if (characteristics.damage) {
          characteristics.weapon = {
            damage: { min: characteristics.damage.min, max: characteristics.damage.max },
            signature: 100
          };
        } else {
          characteristics.weapon = {
            damage: { min: 0, max: 0 },
            signature: 100
          };
        }

        characteristics.health = {
          armor: characteristics.life,
          signature: 100
        };
      }

      // --------------------------------------------------------------
      // TODO: Нужно отрефакторить поле characteristics
      //       Сейчас нельзя брать special из characteristics
      //       при рассчете эффектов, т.к. это вызовет бесконечный цикл
      Object.defineProperty(this, 'special', {
        get: function() {
          return options.characteristics.special;
        },
        enumerable: true
      });

      Object.defineProperty(this, 'characteristics', {
        get: function() {
          var characteristics = Game.Helpers.deepClone(options.characteristics);

          var result = Game.Effect.Military.applyTo(this, characteristics, false);
          result.base = options.characteristics;

          return result;
        },
        enumerable: true
      });

      // TODO: Продумать и переделать эту хрень!
      //       Если битва идет на земле, то мы не можем использовать characteristics,
      //       так как Meteor.userId() выкидывает исключение.
      //       По этому был создан этот метод, чтобы применять эффекты только из
      //       общих исследований.
      Object.defineProperty(this, 'earthCharacteristics', {
        get: function() {
          var characteristics = _.clone(options.characteristics);
          if (options.characteristics.damage) {
            characteristics.damage = _.clone(options.characteristics.damage);
          }

          // Выбираем только общие эффекты (последний аргумент = true)
          var result = Game.Effect.Military.applyTo(this, characteristics, false, true);
          result.base = options.characteristics;

          return result;
        },
        enumerable: true
      });
      // --------------------------------------------------------------
    }

    this.triggers = options.triggers;

    this.menu = game.setToMenu;
    this.side = game.setToSide;


    this.group = options.group || this.side;

    //game[this.menu][this.side][this.engName] = this;
  };

  this.constructor(options);

  this.deepFreeze = function() {
    Game.Helpers.deepFreeze(this, ['requirements', 'targets', 'special', 'characteristics', 'earthCharacteristics']);
  };

  this.currentLevel = function() {
    return Game.getObjectByType(this.type).get(this.group, this.engName);
  };

  this.getOverlayImage = function(currentLevel) {
    currentLevel = currentLevel || this.currentLevel();

    // Select highest level for overlay
    var fitLevels = _.filter(this.overlay.levels, function(level) {
      return level <= currentLevel;
    });

    var level = _.max(fitLevels);

    if (level != -Infinity) {
      return [this.type, this.group, this.engName, level].join('/') + '.' + (this.overlay.type || 'png');
    }
    return null;
  };

  this.getOverlay = function() {
    if (!this.overlay) {
      return null;
    }
    var currentLevel = this.currentLevel();

    var progress = this.progress();

    if (progress) {
      progress.img = this.getOverlayImage(progress.level);
    }

    var result = {
      img: this.getOverlayImage(currentLevel),
      x: this.overlay.x,
      y: this.overlay.y,
      z: this.overlay.z,
      progress: progress
    };

    return result;
  };

  this.price = function(level, cards=[]) {
    var curPrice = {};
    var name = null;

    if (this.type != 'unit'
     && this.type != 'reptileUnit'
     && this.type != 'mutual'
    ) {
      // Цена идет на подъем ДО указаного уровня с предыдущего
      // т.к. начальный уровень нулевой, то цена для первого уровня
      // является ценой подъема с нулевого до первого
      level = level ? level - 1 : this.currentLevel();

      var basePrice = this.basePrice(level);
      var sum = 0;
      for (name in basePrice) {
        curPrice[name] = basePrice[name][1].call(
          this,
          level,
          basePrice[name][0],
          basePrice[name][2]
        );
        sum += curPrice[name];
      }

      if (!curPrice.time) {
        curPrice.time = Math.max( Math.floor(sum / 12), 30 );
      }
    } else {
      level = level ? level : 1;

      for (name in this.basePrice) {
        curPrice[name] = this.basePrice[name] * level;
      }
    }

    Object.defineProperty(curPrice, 'base', {
      value: _.clone(curPrice)
    });

    curPrice = Game.Effect.Price.applyTo(this, curPrice, undefined, null, getCardEffects(cards));

    for (let name in curPrice) {
      if (curPrice.hasOwnProperty(name)) {
        let value = curPrice[name];

        if (name === 'time') {
          if (value < 2) {
            curPrice[name] = 2;
          }
        } else {
          if (value < 0) {
            curPrice[name] = 0;
          }
        }
      }
    }

    return curPrice;
  };

  this.next = {
    price: (function(level) {
      level = (level || this.currentLevel()) + 2;

      return this.price(level);
    }).bind(this)
  };

  this.progress = function() {
    var progressItem = Game.Queue.getGroup(this.group);

    if (progressItem && progressItem.engName == this.engName) {
      return progressItem;
    } else {
      return false;
    }
  };

  this.isEnoughResources = function(count, currency) {
    if (count === undefined) {
      if (this.type == 'unit' || this.type == 'mutual') {
        count = 1;
      } else {
        count = this.currentLevel() + 1;
      }
    }
    var user = Meteor.user();
    var price = this.price(count);

    if (currency) {
      if (currency == 'credits') {
        price = {
          credits: price.credits
        };
      } else {
        delete price.credits;
      }
    }

    var resources = Game.Resources.getValue();

    if (!resources) {
      return false;
    }

    for (var name in price) {
      if (name == 'time') {
        continue;
      }
      if (!resources[name] || resources[name].amount < price[name]) {
        return false;
      }
    }

    return true;
  };

  this.meetRequirements = function() {
    if (this.requirements) {
      for (var key in this.requirements) {
        if (!this.requirements[key][0].has(this.requirements[key][1])) {
          return false;
        }
      }
    }
    return true;
  };

  this.canBuild = function(count, currency) {
    if (currency) {
      var price = this.price(count); 
      if (
          (currency == 'credits' && price.credits) 
       || (currency == 'resources' && (price.metals || price.crystals || price.humans || price.honor))
      ) {
        return this.meetRequirements() && this.isEnoughResources(count, currency);
      }
    }

    return this.meetRequirements() && this.isEnoughResources(count) && !Game.Queue.getGroup(this.group);
  };

  this.has = function(level) {
    level = level || 1;
    return (this.currentLevel() >= level);
  };
};

let getCardEffects = function(cards) {
  let effects = [];

  for (let card of cards) {
    for (let effect of card.effect) {
      effects.push(effect);
    }
  }

  return effects;
};

function extend(Child, Parent) {
  var F = function() {};
  F.prototype = Parent.prototype;
  Child.prototype = new F();
  Child.prototype.constructor = Child;
  Child.superclass = Parent.prototype;

  for (var something in Parent) {
    if (something != 'superclass') {
      Child[something] = Parent[something];
    }
  }
}

game.extend = extend;


Game = {
  PRODUCTION_FACTOR: 1.48902803168182,
  PRICE_FACTOR: 1.568803194,

  effects: {
    price: {
      building: {
        list: []
      },
      research: {
        list: []
      },
      unit: {
        list: []
      },
      list: []
    },
    military: {
      list: []
    },
    special: {
      list: []
    },
    income: {
      list: []
    },
  },

  Persons: {
    tamily: {
      name: 'Советник Тамили'
    },
    thirdenginery: {
      name: 'Третий Инженерный',
      text: 'Третий Инженерный на связи! Приятно вас снова видеть, Консул. После предыдущей работы над техникой во время первой волны освобождения Земли нас перебросили в военную отрасль немного другого формата. В общем, мы теперь работаем над военными зданиями, правитель. Качество гарантируем.'
    },
    vaha: {
      name: 'Комиссар Вахаёбович',
      text: 'Понятия не имею, хуля я тут делаю, но эти ебланы из Совета не подпускают меня к войскам до начала боя. Посадили меня курировать оборону консулов… Да ну и хер с ним, по летающим мишеням стрелять веселее, верно ведь, Консул?'
    },
    psm: {
      name: 'Главнокомандующий ФШМ',
      text: 'Рад, что вы снова с нами, Консул. Портал вновь открыт, но не время расслабляться. Вам, как и многим другим Консулам, придётся через многое пройти, чтобы победить Рептилий, но я уверен, что вы справитесь. На связи, Консул.'
    },
    tilps: {
      name: 'Капитан Тилпс',
      text: 'Я слежу за подготовкой солдат и техники к бою, Консул. Задача не из лёгких, доложу я вам, но ведь никто не говорил, что будет просто, верно? В любом случае, у нас с вами одна цель. Спасибо за помощь, Консул. Мы это очень ценим, даже Вахаёбович, хотя он и не признается никогда.'
    },
    nataly: {
      name: 'Натали Верлен',
      text: 'О! Здравствуйте, Командующий. Думаю, вы помните меня как руководителя десятой инженерной бригады. Ну что же, это я, конечно, помните. Теперь мы работаем над системами улучшения различных приборов, а также совершаем новые открытия. Двигаем вперёд научный прогресс! В общем, Консул, если вам нужно что-то улучшить — сразу ко мне. И помните, для науки нет ничего невозможного!'
    },
    mechanic: {
      name: 'Механик',
      text: 'У меня много имён: Защитник, Перевозчик… Но ты, Консул, можешь называть меня Механик. Я занимаюсь тем, что доставляю свежайшие и мощнейшие технологии для усиления флота. Если хочешь господствовать в небе, то ты обратился по адресу. Я сделаю твой флот в разы мощнее, чем эти железяки чешуйчатых. Естественно, не за бесплатно…'
    },
    calibrator: {
      name: 'Калибратор',
      text: 'О, Консул! Я вас не заметил… Я тут это, калибрую потихоньку. Знаете, тысячи различных приказов поступают ото всех Консулов галактики. Всё это нужно отсортировать, каталогизировать и разослать в научные отделы, а после, когда технология будет исследована, ещё и сообщить в Лаборатории на каждую из колоний… Ох, извините, что загружаю. Пора возвращаться к калибровке.'
    },
    bolz: {
      name: 'Адмирал Стил Болз',
      text: 'Доброго дня вам, Консул. Или сейчас ночь? В космосе хрен разберёшь. Если у вас есть какие-то войска на отправку – закидывайте это мясо в трюмы, мои ребята доставят их на Землю с ветерком… Ну, или не доставят, тут уж как повезёт.'
    },
    renexis: {
      name: 'Ведущая Ренексис',
      text: 'Привет!'
    },
    general: {
      name: 'Генерал Тон Ренек'
    }
  },

  getMidnightDate: function(date = this.getCurrentServerTime() * 1000) {
    if (Meteor.isClient) {
      date = date.valueOf();

      let millisecondsPerDay = 86400000;
      let daysFromMidnight = Math.floor((date - Session.get('serverMidnight')) / millisecondsPerDay);

      return Session.get('serverMidnight') + millisecondsPerDay * daysFromMidnight;
    } else {
      let midnight = new Date(date);
      midnight.setHours(0, 0, 0, 0);

      return midnight.valueOf();
    }
  },
  
  getCurrentTime: function() {
    return Math.floor(new Date().valueOf() / 1000);
  },

  getCurrentServerTime: function() {
    if (Meteor.isClient) {
      return Session.get('serverTime');
    } else {
      return Math.floor(new Date().valueOf() / 1000);
    }
  },

  getObjectByType: function(type) {
    switch(type) {
      case 'building':
        return Game.Building;

      case 'unit':
        return Game.Unit;

      case 'mutual':
        return Game.Mutual;

      case 'research':
        return Game.Research;

      case 'spaceEvent':
        return Game.SpaceEvents;

      case 'card':
        return Game.Cards;

      case 'achievement':
        return Game.Achievements;

      case 'artefact':
        return Game.Artefacts;

      case 'house':
        return Game.House;

      default:
        throw new Meteor.Error('Такого объекта нет');
    }
  },

  getObjectByPath: function(obj) {
    if (_.isString(obj) && Game.EntranceReward.ranks[obj]) {
      return Game.EntranceReward.ranks[obj];
    }

    let type = _.keys(obj)[0];
    let group = '';
    let engName = '';
    switch(type) {
      case 'units':
        group = _.keys(obj[type])[0];
        engName = _.keys(obj[type][group])[0];
        return Game.Unit.items.army[group][engName];

      case 'houseItems':
        group = _.keys(obj[type])[0];
        engName = _.keys(obj[type][group])[0];
        return Game.House.items[group][engName];

      case 'resources':
        engName = _.keys(obj[type])[0];
        let artefact = Game.Artefacts.items[engName];
        
        // TODO : remove resources hardcode
        return artefact || {
          engName,
          type: 'resource',
          icon: '/img/game/' + engName + '.png',
          image: '/img/game/' + engName + '.jpg'
        };

      case 'cards':
        engName = _.keys(obj[type])[0];
        return Game.Cards.items.donate[engName];

      case 'containers':
        engName = _.keys(obj[type])[0];
        return Game.Building.special.Container.items[engName];

      case 'votePower':
        return {
          engName: 'votePower',
          type: 'votePower',
          icon: '/img/game/votepower.png',
          image: '/img/game/votepower.jpg'
        };
    }
  },

  hasPremium: function() {
    return Game.Cards.hasTypeActive('donate');
  }
};

Game.Random = {
  random: function() {
    return Random.fraction();
  },

  interval: function(min, max) {
    return min + Math.round( Random.fraction() * (max - min) );
  },

  chance: function(chance) {
    return Game.Random.interval(1, 100) <= chance ? true : false;
  }
};

Game.Effect = function(options) {
  this.constructor = function(options) {
    this.name = options.name;
    this.notImplemented = options.notImplemented;
    this.pretext = options.pretext;
    this.aftertext = options.aftertext;
    this.condition = options.condition;
    this.priority = options.priority;
    //this.type = options.type;
    this.affect = options.affect;
    this.result = options.result;

    Object.defineProperty(this, 'level', {
      get: function() {
        return this.provider.currentLevel();
      },
      enumerable: true
    });
  };

  this.constructor(options);

  this.deepFreeze = function() {
    Game.Helpers.deepFreeze(this, ['level', 'provider']);
  };

  this.next = function(level) {
    level = (level || this.level) + 1;

    return {
      name: this.name,
      pretext: this.pretext,
      aftertext: this.aftertext,
      condition: this.condition,
      priority: this.priority,
      affect: this.affect,
      
      level: level,
      result: this.result(level)
    };
  };

  this.setProvider = function(provider) {
    Object.defineProperty(this, 'provider', {
      value: provider,
      enumerable: false
    });
  };

  this.register = function(obj) {
    //this.provider = obj;
    this.setProvider(obj);

    if (this.condition && this.condition.type != 'all') {
      // Если влияет только на конкретный объект
      if (this.condition.engName) {
        if (Game.effects[this.type][this.condition.engName] === undefined) {
          Game.effects[this.type][this.condition.engName] = {list: []};
        }

        Game.effects[this.type][this.condition.engName].list.push(this);
      } else {
        if (Game.effects[this.type][this.condition.type] === undefined) {
          Game.effects[this.type][this.condition.type] = {list: []};
        }

        if (this.condition.group) {
          if (Game.effects[this.type][this.condition.type][this.condition.group] === undefined) {
            Game.effects[this.type][this.condition.type][this.condition.group] = {list: []};
          }

          if (this.condition.special) {
            if (Game.effects[this.type][this.condition.type][this.condition.group][this.condition.special] === undefined) {
              Game.effects[this.type][this.condition.type][this.condition.group][this.condition.special] = {list: []};
            }
            Game.effects[this.type][this.condition.type][this.condition.group][this.condition.special].list.push(this);
          } else {
            Game.effects[this.type][this.condition.type][this.condition.group].list.push(this);
          }
        } else {
          Game.effects[this.type][this.condition.type].list.push(this);
        }
      }
    } else {
      if (Game.effects[this.type] === undefined) {
        Game.effects[this.type] = {list: []};
      }
      Game.effects[this.type].list.push(this);
    }
  };
};

Game.Effect.getRelatedTo = function(obj, isOnlyMutual, instantEffects = []) {
  var effects = {};
  var i = 0;

  // По имени
  if (Game.effects[this.type][obj.engName]) {
    for (i = 0; i < Game.effects[this.type][obj.engName].list.length; i++) {
      if (effects[Game.effects[this.type][obj.engName].list[i].priority] === undefined) {
        effects[Game.effects[this.type][obj.engName].list[i].priority] = [];
      }

      effects[Game.effects[this.type][obj.engName].list[i].priority].push(
        Game.effects[this.type][obj.engName].list[i]
      );
    }
  }

  if (Game.effects[this.type][obj.type]) {
    // По типу
    if (Game.effects[this.type][obj.type].list) {
      for (i = 0; i < Game.effects[this.type][obj.type].list.length; i++) {
        if (effects[Game.effects[this.type][obj.type].list[i].priority] === undefined) {
          effects[Game.effects[this.type][obj.type].list[i].priority] = [];
        }

        effects[Game.effects[this.type][obj.type].list[i].priority].push(
          Game.effects[this.type][obj.type].list[i]
        );
      }
    }

    if (Game.effects[this.type][obj.type][obj.group]) {
      // По группе
      if (Game.effects[this.type][obj.type][obj.group].list) {
        for (i = 0; i < Game.effects[this.type][obj.type][obj.group].list.length; i++) {
          if (effects[Game.effects[this.type][obj.type][obj.group].list[i].priority] === undefined) {
            effects[Game.effects[this.type][obj.type][obj.group].list[i].priority] = [];
          }

          effects[Game.effects[this.type][obj.type][obj.group].list[i].priority].push(
            Game.effects[this.type][obj.type][obj.group].list[i]
          );
        }
      }

      // По особенности
      if (
          obj.special
       && Game.effects[this.type][obj.type][obj.group][obj.special]
       && Game.effects[this.type][obj.type][obj.group][obj.special].list
      ) {
        for (i = 0; i < Game.effects[this.type][obj.type][obj.group][obj.special].list.length; i++) {
          if (effects[Game.effects[this.type][obj.type][obj.group][obj.special].list[i].priority] === undefined) {
            effects[Game.effects[this.type][obj.type][obj.group][obj.special].list[i].priority] = [];
          }

          effects[Game.effects[this.type][obj.type][obj.group][obj.special].list[i].priority].push(
            Game.effects[this.type][obj.type][obj.group][obj.special].list[i]
          );
        }
      }
    }
  }

  for (let effect of instantEffects) {
    let insertEffect = null;

    if (effect.condition.type === 'all') {
      insertEffect = effect;
    } else if (effect.condition.engName === obj.engName) {
      insertEffect = effect;
    } else if (effect.condition.type === obj.type) {
      if (!effect.condition.group || effect.condition.group === obj.group) {
        if (!effect.condition.special || effect.condition.special === obj.special) {
          insertEffect = effect;
        }
      }
    }

    if (insertEffect) {
      if (effects[insertEffect.priority] === undefined) {
        effects[insertEffect.priority] = [];
      }

      effects[insertEffect.priority].push(insertEffect);
    }
  }

  // Общий
  if (this.type != 'special') {
    for (i = 0; i < Game.effects[this.type].list.length; i++) {
      if (effects[Game.effects[this.type].list[i].priority] === undefined) {
        effects[Game.effects[this.type].list[i].priority] = [];
      }

      effects[Game.effects[this.type].list[i].priority].push(Game.effects[this.type].list[i]);
    }
  }

  // TODO: Убрать эту херню позже!
  //       Смотри метод earthCharacteristics!
  if (!isOnlyMutual) {

    // Items, Cards, Achievements
    var items = Game.House.getPlacedItems();

    var cards = Game.Cards.getActive();
    if (cards && cards.length > 0) {
      items = items.concat(cards);
    }

    var achievements = Game.Achievements.getCompleted();
    if (achievements && achievements.length > 0) {
      items = items.concat(achievements);
    }

    for (i = 0; i < items.length; i++) {
      if (!items[i].effect) {
        continue;
      }
      
      for (var k = 0; k < items[i].effect.length; k++) {
        var effect = items[i].effect[k];

        if (effect.type == this.type) {
          if (effect.condition) {
            if (effect.condition.engName && obj.engName != effect.condition.engName) {
              continue;
            }

            if (effect.condition.type && obj.type != effect.condition.type) {
              continue;
            }

            if (effect.condition.group && obj.group != effect.condition.group) {
              continue;
            }

            if (effect.condition.special && obj.special != effect.condition.special) {
              continue;
            }
          }

          if (effects[effect.priority] === undefined) {
            effects[effect.priority] = [];
          }

          effects[effect.priority].push(effect);
        }
      }  
    }

  }

  var result = {};
  var cache = {};
  var value = null;
  var provider = null;

  for (var priority in effects) {
    result[priority] = {};
    for (i = 0; i < effects[priority].length; i++) {

      // TODO: Убрать эту херню позже!
      //       Смотри метод earthCharacteristics!
      if (isOnlyMutual && effects[priority][i].provider.type != 'mutual') {
        continue;
      }

      if (_.isArray(effects[priority][i].affect)) {

        // Cache for building & research
        if (['building', 'research'].indexOf(effects[priority][i].provider.type) != -1) {
          provider = effects[priority][i].provider;
          if (cache[provider.type] === undefined) {
            cache[provider.type] = Game.getObjectByType(provider.type).getValue() || {};
          }

          value = effects[priority][i].result(
            cache[provider.type] && cache[provider.type][provider.group] && cache[provider.type][provider.group][provider.engName]
              ? cache[provider.type][provider.group][provider.engName]
              : 0
          );
        } else {
          value = effects[priority][i].result();
        }

        if (value && value !== undefined) {
          for (var resource in effects[priority][i].affect) {
            if (result[priority][effects[priority][i].affect[resource]] === undefined) {
              result[priority][effects[priority][i].affect[resource]] = [];
            }

            result[priority][effects[priority][i].affect[resource]].push({
              value: (Math.floor((value * 100)) / 100),
              provider: effects[priority][i].provider,
              type: effects[priority][i].type,
              priority: effects[priority][i].priority
            });
          }
        }
      } else {
        if (result[priority][effects[priority][i].affect] === undefined) {
          result[priority][effects[priority][i].affect] = [];
        }

        // Cache for building & research
        if (['building', 'research'].indexOf(effects[priority][i].provider.type) != -1) {
          provider = effects[priority][i].provider;
          if (cache[provider.type] === undefined) {
            cache[provider.type] = Game.getObjectByType(provider.type).getValue() || {};
          }

          value = effects[priority][i].result(
            cache[provider.type] && cache[provider.type][provider.group] && cache[provider.type][provider.group][provider.engName]
              ? cache[provider.type][provider.group][provider.engName]
              : 0
          );
        } else {
          value = effects[priority][i].result();
        }

        if (value && value !== undefined) {
          result[priority][effects[priority][i].affect].push({
            value: (Math.floor((value * 100)) / 100),
            provider: effects[priority][i].provider,
            type: effects[priority][i].type,
            priority: effects[priority][i].priority
          });
        }
      }
    }
  }

  return result;
};

Game.Effect.getAll = function() {
  return this.getRelatedTo({});
};

Game.Effect.getValue = function(hideEffects, obj, cards = []) {
  hideEffects = hideEffects === undefined ? true : hideEffects;
  var effects = obj === undefined ? this.getAll() : this.getRelatedTo(obj, null, getCardEffects(cards));
  var result = {};

  Object.defineProperty(result, 'effects', {
    value: effects,
    configurable: true,
    enumerable: !hideEffects
  });

  for (var priority in effects) {
    for (var item in effects[priority]) {
      var effect = 0;
      for (var i = 0; i < effects[priority][item].length; i++) {
        effect += effects[priority][item][i].value;
      }

      if (result[item] === undefined) {
        result[item] = 0;
      }

      if (priority % 2 == 1) {
        result[item] += effect;
      } else {
        result[item] = result[item] + Math.floor(result[item] * (0.01 * effect));
      }
    }
  }

  return result;
};

// reduce - true = скидка, т.е. вычитаем эффекты
Game.Effect.applyTo = function(target, obj, hideEffects, isOnlyMutual, instantEffects = []) {
  hideEffects = hideEffects === undefined ? true : hideEffects;
  var effects = this.getRelatedTo(target, isOnlyMutual, instantEffects);

  Object.defineProperty(obj, 'effects', {
    value: effects,
    configurable: true,
    enumerable: !hideEffects
  });

  for (var priority in effects) {
    for (var item in effects[priority]) {
      var effect = 0;
      for (var i = 0; i < effects[priority][item].length; i++) {
        effect += effects[priority][item][i].value;
      }

      if (obj[item] === undefined) {
        continue;
      }

      switch (item) {
        case 'damage':
          if (priority % 2 === 1) {
            obj.weapon.damage.min += effect * (this.reduce ? -1 : 1);
            obj.weapon.damage.max += effect * (this.reduce ? -1 : 1);
          } else {
            obj.weapon.damage.min = obj.weapon.damage.min +
              (Math.floor(obj.weapon.damage.min * (0.01 * effect)) * (this.reduce ? -1 : 1));

            obj.weapon.damage.max = obj.weapon.damage.max +
              (Math.floor(obj.weapon.damage.max * (0.01 * effect)) * (this.reduce ? -1 : 1));
          }
          break;

        case 'life':
          if (priority % 2 === 1) {
            obj.health.armor += effect * (this.reduce ? -1 : 1);
          } else {
            obj.health.armor = obj.health.armor +
              (Math.floor(obj.health.armor * (0.01 * effect)) * (this.reduce ? -1 : 1));
          }
          break;

        default:
          if (priority % 2 == 1) {
            obj[item] += effect * (this.reduce ? -1 : 1);
          } else {
            obj[item] = obj[item] + Math.floor(obj[item] * (0.01 * effect)) * (this.reduce ? -1 : 1);
          }
          break;
      }
    }
  }

  return obj;
};

Game.Effect.Income = function(options) {
  Game.Effect.Income.superclass.constructor.apply(this, arguments);

  if (!options.affect) {
    throw new Meteor.Error('Не установлена цель эффекта');
  }

  this.type = 'income';
  this.reduce = false;
};
extend(Game.Effect.Income, Game.Effect);
Game.Effect.Income.type = 'income';
Game.Effect.Income.reduce = false;

Game.Effect.Price = function(options) {
  Game.Effect.Price.superclass.constructor.apply(this, arguments);

  this.type = 'price';
  this.reduce = true;
};
extend(Game.Effect.Price, Game.Effect);
Game.Effect.Price.type = 'price';
Game.Effect.Price.reduce = true;


Game.Effect.Military = function(options) {
  Game.Effect.Military.superclass.constructor.apply(this, arguments);

  this.type = 'military';
  this.reduce = false;
};
extend(Game.Effect.Military, Game.Effect);
Game.Effect.Military.type = 'military';
Game.Effect.Military.reduce = false;

Game.Effect.ProfitOnce = function(options) {
  Game.Effect.ProfitOnce.superclass.constructor.apply(this, arguments);

  this.type = 'profitOnce';
  this.reduce = false;
};
extend(Game.Effect.ProfitOnce, Game.Effect);
Game.Effect.ProfitOnce.type = 'profitOnce';
Game.Effect.ProfitOnce.reduce = false;

Game.Effect.Special = function(options) {
  Game.Effect.Special.superclass.constructor.apply(this, arguments);

  this.type = 'special';
  this.reduce = false;
};
extend(Game.Effect.Special, Game.Effect);
Game.Effect.Special.type = 'special';
Game.Effect.Special.reduce = false;


Game.Queue = {
  status: {
    INCOMPLETE: 0,
    INPROGRESS: 1,
    DONE: 2
  },

  Collection: new Meteor.Collection('queue'),

  getAll: function() {
    return Game.Queue.Collection.find({
      user_id: Meteor.userId(),
      status: Game.Queue.status.INCOMPLETE
    }).fetch();
  },

  getGroup: function(group) {
    return Game.Queue.Collection.findOne({
      user_id: Meteor.userId(),
      group: group,
      status: Game.Queue.status.INCOMPLETE
    });
  },

  isBusy: function(group) {
    if (Meteor.userId()) {
      return Game.Queue.getGroup(group);  
    }
    return false;
  }
};


game.Function = function(options) {
  Game.functions[options.key] = options.func;
};

Game.functions = {};

initFunctionsContent();

Game.Helpers = {
  formatHours: function(timestamp, offset) {
    // offset in minutes
    if (offset === undefined || !_.isNumber(offset)) {
      // if not defined, then use local offset
      offset = new Date().getTimezoneOffset();
    }

    var date = new Date((timestamp - (offset * 60)) * 1000);
    return (
        ('0' + date.getUTCHours()).slice(-2) + ':'
      + ('0' + date.getUTCMinutes()).slice(-2)
    );
  },

  formatDate: function(timestamp, offset) {
    // offset in minutes
    if (offset === undefined || !_.isNumber(offset)) {
      // if not defined, then use local offset
      offset = new Date().getTimezoneOffset();
    }

    var date = new Date((timestamp - (offset * 60)) * 1000);
    return (
        ('0' + date.getUTCDate()).slice(-2) + '.'
      + ('0' + (date.getUTCMonth() + 1)).slice(-2) + '.'
      + date.getUTCFullYear() + ' '
      + ('0' + date.getUTCHours()).slice(-2) + ':'
      + ('0' + date.getUTCMinutes()).slice(-2) + ':'
      + ('0' + date.getUTCSeconds()).slice(-2)
    );
  },

  formatSeconds: function(seconds) {
    if (seconds < 0) {
      return '…';
    }

    var hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    return (hours > 99 ? hours : ('0' + hours).slice(-2)) + ':'
      + ('0' + minutes).slice(-2) + ':'
      + ('0' + seconds).slice(-2);
  },

  getNumeralEnding: function (num, endings) {
    if (!endings || endings.length === 0) {
      return '';
    }

    var i = 0;
    if (num < 5 || num > 20) {
      var m = num % 10;
      if (m == 1) {
        i = 1;
      } else if (m > 1 && m < 5) {
        i = 2;
      }
    }

    return (i < endings.length) ? endings[i] : endings[endings.length - 1];
  },

  formatTime: function (seconds) {
    if (seconds < 0) {
      return '…';
    }

    var result = [];

    var days = Math.floor(seconds / 86400);
    if (days > 0) {
      seconds -= days * 86400;
      result.push(days + ' ' + Game.Helpers.getNumeralEnding(days, ['дней', 'день', 'дня']));
    }

    var hours = Math.floor(seconds / 3600);
    if (hours > 0) {
      seconds -= hours * 3600;
      result.push(hours + ' ' + Game.Helpers.getNumeralEnding(hours, ['часов', 'час', 'часа']));
    }

    var minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      seconds -= minutes * 60;
      result.push(minutes + ' ' + Game.Helpers.getNumeralEnding(minutes, ['минут', 'минута', 'минуты']));
    }

    if (seconds > 0) {
      result.push(('0' + seconds).slice(-2));
    }

    return result.join(' ');
  },

  deepFreeze: function (obj, skipFields = ['Collection']) {
    let propNames = Object.getOwnPropertyNames(obj);

    for (let name of propNames) {
      if (skipFields.indexOf(name) === -1) {
        let prop = obj[name];

        if (typeof prop === 'object' && prop !== null) {
          if (typeof prop.deepFreeze === 'function') {
            prop.deepFreeze();
          } else {
            this.deepFreeze(prop);
          }
        }
      }
    }

    return Object.freeze(obj);
  },

  deepClone: function deepClone(object) {
    const clone = _.clone(object);

    _.each(clone, function(value, key) {
      if (_.isObject(value)) {
        clone[key] = deepClone(value);
      }
    });

    return clone;
  },
};
