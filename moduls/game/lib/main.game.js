import effectClasses from '/imports/modules/Effect/lib';
import MilitaryEffect from '/imports/modules/Effect/lib/MilitaryEffect';
import PriceEffect from '/imports/modules/Effect/lib/PriceEffect';
import { priceT1, priceT2, priceT3, priceT4 } from '/imports/content/formula';

let content;
Meteor.startup(() => {
  if (Meteor.isClient) {
    content = require('/imports/content/client').default;
  } else {
    content = require('/imports/content/server').default;
  }
});

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
};

var itemCurrentOrder = 0;

game.Item = function(options) {
  this.constructor = function(options) {
    var self = this;

    this.options = options;

    this.order = itemCurrentOrder;
    itemCurrentOrder++;

    this.name = options.name;
    this.engName = options.engName;

    if (options.effects) {
      this.effects = [];
      this.effect = this.effects;
      _(options.effects).pairs().forEach(([type, effectList]) => {
        effectList.forEach((effect) => {
          const effectObject = new effectClasses[type](effect);
          this.effects.push(effectObject);
  
          if (!this.doNotRegisterEffect) {
            effectObject.register(this);
          } else {
            effectObject.setProvider(this);
          }
        });
      });
    } else if (options.effect) {
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
      this.effect = options.effect;
      this.effects = this.effect;
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

    this.getRequirements = (level = this.getCurrentLevel()) => options.requirements(level);

    if (options.targets) {
      this.targets = options.targets;
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
      } else {
        // !
        options.characteristics.damage = options.characteristics.weapon.damage;
        options.characteristics.life = options.characteristics.health.armor;
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

      const getCharacteristics = (additionalOptions = {}) => {
        const characteristics = Game.Helpers.deepClone(options.characteristics);

        const result = MilitaryEffect.applyTo({
          ...additionalOptions,
          target: this,
          obj: characteristics,
          hideEffects: false,
        });
        result.base = {
          ...options.characteristics,
          damage: options.characteristics.weapon.damage,
          life: options.characteristics.health.armor,
        };

        return result;
      };
      Object.defineProperty(this, 'characteristics', {
        get: getCharacteristics,
        enumerable: true,
      });
      this.getCharacteristics = additionalOptions => getCharacteristics(additionalOptions);

      this.getBaseCharacteristics = () => Game.Helpers.deepClone(options.characteristics);
    }

    this.triggers = options.triggers;

    this.menu = game.setToMenu;
    this.side = game.setToSide;


    this.group = options.group || this.side;

    //game[this.menu][this.side][this.engName] = this;
  };

  this.constructor(options);

  this.deepFreeze = function() {
    Game.Helpers.deepFreeze(this, ['requirements', 'targets', 'special', 'characteristics']);
  };

  this.currentLevel = function(options) {
    return Game.getObjectByType(this.type).get({
      ...options,
      group: this.group,
      engName: this.engName,
    });
  };

  // New-to-legacy
  this.getCurrentLevel = this.currentLevel; 

  this.getOverlayImage = function(currentLevel) {
    currentLevel = currentLevel || this.currentLevel();

    // Select highest level for overlay
    var fitLevels = _.filter(this.overlay.levels, function(level) {
      return level <= currentLevel;
    });

    var level = _.max(fitLevels);

    if (level != -Infinity) {
      return '/img/game/' + [this.type, this.group, this.engName, level].join('/') + '.' + (this.overlay.type || 'png');
    }
    return null;
  };

  this.getOverlayOwn = function() {
    const imgName = (this.overlay && this.overlay.own) || 'item';
    return `/img/game/${this.type}/${this.group}/${this.engName}/${imgName}.png`;
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

  this.getBasePrice = function (count = 1) {
    const curPrice = { base: {} };

    _(this.basePrice).keys().forEach((resource) => {
      curPrice.base[resource] = Math.ceil(this.basePrice[resource] * count);
    });

    return curPrice;
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

      let basePrice;
      if (_(this.basePrice).isFunction()) {
        basePrice = this.basePrice(level);
        for (name in basePrice) {
          curPrice[name] = basePrice[name][1].call(
            this,
            level,
            basePrice[name][0],
            basePrice[name][2]
          );
        }
      } else {
        switch (this.basePrice.tier) {
          case 1:
            basePrice = priceT1.call(this, level, this.basePrice.group);
            break;
          case 2:
            basePrice = priceT2.call(this, level, this.basePrice.group);
            break;
          case 3:
            basePrice = priceT3.call(this, level, this.basePrice.group);
            break;
          default:
            basePrice = priceT4.call(this, level, this.basePrice.group);
            break;
        }
        for (var resourceName in basePrice) {
          const idParts = resourceName.split('/');
          let realName = idParts[idParts.length - 1].toLocaleLowerCase();
          if (Game.newToLegacyNames[realName]) {
            realName = Game.newToLegacyNames[realName];
          }
          curPrice[realName] = Game.functions[basePrice[resourceName][1]].call(
            this,
            level,
            basePrice[resourceName][0],
            basePrice[resourceName][2],
          );
        }
      }
    } else {
      level = level ? level : 1;

      for (name in this.basePrice) {
        curPrice[name] = Math.ceil(this.basePrice[name] * level);
      }
    }

    if (!curPrice.time) {
      const rating = Game.Resources.calculateRatingFromResources(curPrice, true);
      curPrice.time = Math.max( Math.floor(rating / 0.12), 2 );
    }

    Object.defineProperty(curPrice, 'base', {
      value: _.clone(curPrice)
    });

    curPrice = PriceEffect.applyTo({
      target: this,
      obj: curPrice,
      instantEffects: getCardEffects(cards),
    });

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

  this.getQueue = this.progress;

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
        if (!this.requirements[key][0].has({ level: this.requirements[key][1] })) {
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
  newToLegacyNames: {
    space: 'fleet',

    mine: 'bomb',
    ionmine: 'ionbomb',
    triplecrystalgun: 'trilinear',
    orbitaldefensestation: 'deforbital',

    father: 'fathers',
    psiman: 'psimans',

    xynlet: 'prickartillery',

    butterfly: 'relax',
    trionyx: 'trioniks',
    gecko: 'geccon',
    amphisbaena: 'amfizben',

    silverplasmoid: 'silver_plasmoid',
    shipdetails: 'ship_details',
    meteorfragments: 'meteor_fragments',
    weaponparts: 'weapon_parts',
    crystalfragments: 'crystal_fragments',
    emeraldplasmoid: 'emerald_plasmoid',
    rotaryamplifier: 'rotary_amplifier',
    secrettechnology: 'secret_technology',
    reptiletechnology: 'reptile_technology',
    sapphireplasmoid: 'sapphire_plasmoid',
    quadcooler: 'quad_cooler',
    plasmatransistors: 'plasma_transistors',
    amethystplasmoid: 'amethyst_plasmoid',
    topazplasmoid: 'topaz_plasmoid',
    ancientartifact: 'ancient_artefact',
    ancienttechnology: 'ancient_technology',
    ancientknowledge: 'ancient_knowledge',
    ancientscheme: 'ancient_scheme',
    rubyplasmoid: 'ruby_plasmoid',

    defensefleet: 'defencefleet',
    metallurgist: 'metallurg',
    leader: 'ruler',
    lossoflosses: 'lossloss',
    seppuku: 'sepukku',

    natalyverlen: 'nataly',
    thirdengineering: 'thirdenginery',

    greenring: 'green_ring',
    bloodymess: 'bloody_mess',
    mortalcombat: 'mortal_combat',
    madrace: 'mad_race',
    firedragon: 'fire_dragon',

    throne: 'tron',

    tamily: 'tamily',
    thirdengineering: 'thirdenginery',
    natalyverlen: 'nataly',
    mechanic: 'mechanic',
    steelbolz: 'bolz',
    vakhaebovich: 'vaha',
    soseuhtilps: 'tilps',
    calibrator: 'calibrator',
    renexis: 'renexis',
    tonerenek: 'general',
    psm: 'psm',
  },

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

  Persons: {},

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

  dateToTime(date) {
    return Math.floor(new Date(date).getTime() / 1000);
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
      case 'houseItems':
        group = _.keys(obj[type])[0];
        engName = _.keys(obj[type][group])[0];
        return Game.House.items[group][engName];

      case 'resources':
        engName = _.keys(obj[type])[0];
        let artefact = Game.Artefacts.items[engName];

        if (artefact) {
          return artefact;
        } else {
          let allResources;
          if (Meteor.isClient) {
            allResources = require('/imports/content/Resource/client').default;
          } else {
            allResources = require('/imports/content/Resource/server').default;
          }

          // TODO : remove resources hardcode
          return allResources[engName];
        }

      case 'cards':
        engName = _.keys(obj[type])[0];
        return Game.Cards.items.donate[engName];

      case 'containers':
        let allContainers;
        if (Meteor.isClient) {
          allContainers = require('/imports/content/Container/client').default;
        } else {
          allContainers = require('/imports/content/Container/server').default;
        }

        engName = _.keys(obj[type])[0];
        return allContainers[engName];

      case 'votePower':
        return {
          engName: 'votePower',
          type: 'votePower',
          icon: '/img/game/votepower.png',
          image: '/img/game/votepower.jpg',
          card: '/img/game/votepower.jpg',
        };

      case 'personSkin':
        let personId = _.keys(obj[type])[0];
        let skinId = _.keys(obj[type][personId])[0];
        
        return {
          engName: 'personSkin',
          type: 'personSkin',
          icon: Game.Persons[personId].getIcon(),
          getIcon: Game.Persons[personId].getIcon(),
          image: Game.Persons[personId].getImage(skinId),
          getImage: Game.Persons[personId].getImage(skinId),
          card: Game.Persons[personId].getImage(skinId),
        };
      case 'units':
        return content[_.keys(obj.units)[0]];

      default:
        return content[obj.id];
    }
  },

  hasPremium: function() {
    return Game.Cards.hasTypeActive({ type: 'donate' });
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
  },

  fromArray(arr) {
    return arr[Game.Random.interval(0, arr.length - 1)];
  },
};

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

  getByItemId(itemId) {
    return Game.Queue.Collection.findOne({
      user_id: Meteor.userId(),
      status: Game.Queue.status.INCOMPLETE,
      itemId,
    });
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
  },

  getSpeedupPrice(item, task) {
    const spendTime = task.finishTime - Game.getCurrentServerTime() - 2;
    const price = { credits: 1 + (300 * ((spendTime / 3600) ** 0.7513)) };

    if (['building', 'research'].indexOf(item.type) !== -1 && task.level <= 20) {
      price.credits = 0; 
    }

    return price;
  },
};


game.Function = function(options) {
  Game.functions[options.key] = options.func;
};

Game.functions = {};
Meteor.startup(() => initFunctionsContent());

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
    var days = Math.floor(seconds / 86400);
    seconds -= days * 86400;
    var fDays = `${days} ${Game.Helpers.getNumeralEnding(days, ['дней', 'день', 'дня'])} `;

    var hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    var fHours = `${(hours > 99 ? hours : ('0' + hours).slice(-2))}ч `;

    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    var fMinutes = `${('0' + minutes).slice(-2)}м `;

    var fSeconds = `${('0' + seconds).slice(-2)}с`;

    if (days === 0) {
      fDays = '';
      if (hours === 0) {
        fHours = '';
        if (minutes === 0) {
          fMinutes = '';
        }
      }
    }

    return `${fDays}${fHours}${fMinutes}${fSeconds}`;
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

Game.Broadcast = {
  Collection: new Meteor.Collection('broadcast'),
}

export { game };
export default Game;
