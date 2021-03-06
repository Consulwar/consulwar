import residentialBuildings from '/imports/content/Building/Residential/client';
import militaryBuildings from '/imports/content/Building/Military/client';
import content from '/imports/content/client';

import humanSpaceUnits from '/imports/content/Unit/Human/Space/client';
import humanDefenseUnits from '/imports/content/Unit/Human/Defense/client';
import humanGroundUnits from '/imports/content/Unit/Human/Ground/client';
import reptileSpaceUnits from '/imports/content/Unit/Reptile/Space/client';
import reptileGroundUnits from '/imports/content/Unit/Reptile/Ground/client';

import evolutionResearches from '/imports/content/Research/Evolution/client';
import fleetResearches from '/imports/content/Research/Fleet/client';

initMenuClient = function() {
'use strict';

var firstItemGroupURL = function(items) {
  var firstItem = items[_.keys(items)[0]];
  return firstItem.url({group: firstItem.group});
};

var firstItemUrl = function(items) {
  var firstItem = items[_.keys(items)[0]];
  return firstItem.url();
};

var menu = {
  planet: {
    name: 'Планета',
    routeName: ['building'],
    url: '/game/planet/Residential',
    items: {
      Residential: {
        name: 'Жилой район',
        additionalArea: 'tamily',
        url: '/game/planet/Residential',
        items: residentialBuildings,
      },
      Military: {
        name: 'Военный район',
        additionalArea: 'thirdenginery',
        url: '/game/planet/Military',
        items: militaryBuildings,
      },
    },
  },
  research: {
    name: 'Исследования',
    routeName: ['research'],
    url: '/game/research/Evolution',
    items: {
      Evolution: {
        name: 'Эволюционные исследования',
        additionalArea: 'nataly',
        url: '/game/research/Evolution',
        items: evolutionResearches,
      },
      Fleet: {
        name: 'Улучшения флота',
        additionalArea: 'mechanic',
        url: '/game/research/Fleet/Gammadrone',
        items: fleetResearches,
      },
    },
  },
  army: {
    name: 'Войска',
    routeName: ['unit'],
    url: firstItemUrl(humanSpaceUnits),
    items: {
      Space: {
        name: 'Космический флот',
        additionalArea: 'bolz',
        url: firstItemUrl(humanSpaceUnits),
        items: humanSpaceUnits,
      },
      Defense: {
        name: 'Планетарная оборона',
        additionalArea: 'vaha',
        url: firstItemUrl(humanDefenseUnits),
        items: humanDefenseUnits,
      },
      Ground: {
        name: 'Армия',
        additionalArea: 'tilps',
        url: firstItemUrl(humanGroundUnits),
        items: humanGroundUnits,
      },
    },
  },
  galaxy: {
    name: 'Космос',
    routeName: ['cosmos'],
    url: Router.routes.cosmos.path()
  },
  earth: {
    name: 'Общее',
    routeName: ['mutual', 'earth'],
    url: Router.routes.earth.path({ group: 'earth' }),
    items: {
      earth: {
        name: 'Земля',
        url: Router.routes.earth.path({ group: 'earth' })
      }
    }
  },
  house: {
    name: 'Палата консула',
    url: Router.routes.house.path({ group: 'house' }),
    overlayItems: function() {
      return Game.House.getActiveItems();
    },
    routeName: ['house', 'walletHistory'],
    items: {
      donate: {
        name: 'Донат',
        engName: 'donate',
        meetRequirements: true,
        isEnoughResources: true,
        url: firstItemUrl(Game.Cards.items.donate),
        items: Game.Cards.items.donate
      },
      room: {
        name: 'Палата',
        engName: 'room',
        meetRequirements: true,
        isEnoughResources: true,
        url: firstItemUrl(Game.House.items.room),
        items: Game.House.items.room
      },
      tron: {
        name: 'Трон',
        engName: 'tron',
        meetRequirements: true,
        isEnoughResources: true,
        url: firstItemUrl(Game.House.items.tron),
        items: Game.House.items.tron
      },
      avatar: {
        name: 'Аватар',
        engName: 'avatar',
        meetRequirements: true,
        isEnoughResources: true,
        url: firstItemUrl(Game.House.items.avatar),
        items: Game.House.items.avatar
      }
    }
  },
  chat: {
    name: 'Связь',
    routeName: ['mail', 'chat'],
    url: Router.routes.chat.path({ room: 'general' }),
    additionalClass: function() {
      if (Game.Quest.hasNewDaily() || Game.Mail.hasUnread()) {
        return 'has_new_mail';
      } else {
        return '';
      }
    },
    items: { 
      chat: {
        name: 'Чат',
        url: Router.routes.chat.path({ room: 'general' }),
        getUrl: function() {
          var activeRoom = Session.get('chatRoom');
          return Router.routes.chat.path({
            room: activeRoom ? activeRoom : 'general'
          });
        }
      },
      mail: {
        name: 'Почта',
        url: Router.routes.mail.path({ page: 1 })
      }
    }
  },
  statistics: {
    name: 'Статистика',
    routeName: ['general', 'science', 'cosmos', 'battle', 'communication', 'krampus'],
    url: Router.routes.statistics.path({ group: 'general'}),
    doNotShowInGameMenu: true,
    items: {
      general: {
        tooltip: "Общая статистика",
        url: Router.routes.statistics.path({ group: 'general' })
      },
      science: {
        tooltip: "Наука",
        url: Router.routes.statistics.path({ group: 'science' })
      },
      cosmos: {
        tooltip: "Космос",
        url: Router.routes.statistics.path({ group: 'cosmos' })
      },
      battle: {
        tooltip: "Война",
        url: Router.routes.statistics.path({ group: 'battle' })
      },
      communication: {
        tooltip: "Общение",
        url: Router.routes.statistics.path({ group: 'communication' })
      },
      krampus: {
        tooltip: "Нашествие Крампусова",
        url: Router.routes.statistics.path({ group: 'krampus' })
      },
      krampussy: {
        tooltip: "Нашествие Крампуссиков",
        url: Router.routes.statistics.path({ group: 'krampussy' })
      }
    }
  },
  artefacts: {
    name: 'Артефакты',
    routeName: ['artefacts'],
    url: firstItemGroupURL(Game.Artefacts.items),
    doNotShowInGameMenu: true,
    directItems: true,
    items: Game.Artefacts.items
  }
};

var getMenu = function(menu, isActive) {
  return _.map(menu, function(menu, key) {
    return {
      engName: key,
      name: menu.name,
      url: menu.url,
      getUrl: menu.getUrl,
      tooltip: menu.tooltip,
      isActive: isActive(menu, key),
      additionalClass: menu.additionalClass
    };
  });
};

Template.top_menu.helpers({
  chatRoom: function() {
    var activeRoom = Session.get('chatRoom');
    return activeRoom ? activeRoom : 'general';
  }
});

Template.main_menu.helpers({
  menu: function() {
    return getMenu(menu, function(item) {
      return item.routeName.indexOf(Router.current().route.getName()) != -1;
    }).filter(function(item) {
      return !menu[item.engName].doNotShowInGameMenu;
    });
  }
});

Template.side_menu.helpers({
  sides: function(showHidden) {
    var group = Router.current().group;

    if (!menu[group] || (!showHidden && menu[group].doNotShowInGameMenu)) {
      return null;
    }

    return getMenu(menu[group].items, function(item, key) {
      let url = item.url;
      if (group === 'statistics') {
        url += '/';
      }
      return Router.current().url.indexOf(url) !== -1;
    });
  },

  getUrl: function(item) {
    return item.getUrl ? item.getUrl() : item.url;
  }
});

var helpers = {
  isArtefactsPage: function() {
    return Router.current().group == 'artefacts';
  },

  items: function() {
    let group = Router.current().group;
    let subgroup = Router.current().params.group;

    let menuItems = null;
    if (menu[group]) {
      if (menu[group].directItems) {
        menuItems = menu[group].items;
      } else if (
           menu[group].items
        && subgroup 
        && menu[group].items[subgroup]
        && menu[group].items[subgroup].items
      ) {
        menuItems = menu[group].items[subgroup].items;
      }
    }

    return menuItems ? _.toArray(menuItems) : [];
  },

  currentValue() {
    if (this.getCurrentLevel) {
      return this.getCurrentLevel();
    }
    if (this.group === 'Ground') {
      return this.getCurrentCount({ from: 'hangar' });
    }
    return this.getCurrentCount();
  },

  overlayItems: function() {
    let group = Router.current().group;
    if (menu[group] && menu[group].overlayItems) {
      return menu[group].overlayItems();
    }

    return helpers.items();
  },

  groupedItems: function(items, name) {
    return _.toArray(_.groupBy(items, function(item) {
      return item[name];
    }));
  },

  currentUrl: function() {
    // Iron router при первом открытии возвращет полный пусть. Обрезаем.
    var currentUrl = Router.current().url;
    return currentUrl.substr(currentUrl.indexOf('/game'));
  },
  isPartOfUrl: function(url, part) {
    // special check for consul house items
    if (Router.current().params.group == 'house') {
      var item = Router.current().params.item;
      if (item) {
        return part.indexOf(url.substr(0, url.indexOf('/' + item))) != -1;
      }
    }
    // other items
    return url.indexOf(part) != -1;
  },
  percentRound10: function(progress) {
    return Math.floor((progress.finishTime - Session.get('serverTime')) * 10 / (progress.finishTime - progress.startTime)) * 10;
  },
  item: function() {
    var route = Router.current();
    let item;
    if (['planet', 'army', 'info', 'research'].indexOf(route.group) !== -1 && route.params.item) {
      let type = route.group[0].toUpperCase() + route.group.slice(1);
      let group = route.params.group[0].toUpperCase() + route.params.group.slice(1);
      const engName = route.params.item[0].toUpperCase() + route.params.item.slice(1);
      if (type === 'Planet') {
        type = 'Building';
      } else if (type === 'Army') {
        type = 'Unit/Human';
      } else if (type === 'Info') {
        type = 'Unit/Reptile';
      }
      if (route.params.subgroup) {
        group += `/${route.params.subgroup}`;
      }

      const id = `${type}/${group}/${engName}`;
      item = content[id];
    } else {
      item =(   
           menu[route.group]
        && menu[route.group].items
        && (  ( menu[route.group].directItems && menu[route.group].items[route.params.item])
          || (  route.params.group 
              && menu[route.group].items[route.params.group]
              && menu[route.group].items[route.params.group].items
              && menu[route.group].items[route.params.group].items[route.params.item]
          )
        )
      );
    }

    return item;
  },
};

Template.items_menu.helpers(helpers);
Template.overlay_menu.helpers(helpers);

};
