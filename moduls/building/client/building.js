import { Meteor } from 'meteor/meteor';
import { Notifications } from '/moduls/game/lib/importCompability';
import Game from '/moduls/game/lib/main.game';
import Building from '/imports/client/ui/blocks/Build/Building/BuildBuilding';
import buildings from '/imports/content/Building/client';
import residentialBuildings from '/imports/content/Building/Residential/client';
import militaryBuildings from '/imports/content/Building/Military/client';
import MenuUnique from '/imports/client/ui/blocks/Menu/Unique/MenuUnique';

initBuildingClient = function() {
'use strict';

initBuildingLib();

Game.Building.showPage = function() {
  var menu = this.params.menu;
  let item;
  const group = this.params.group[0].toUpperCase() + this.params.group.slice(1);
  let menuItems;
  if (group === 'Residential') {
    menuItems = residentialBuildings;
  } else {
    menuItems = militaryBuildings;
  }
  if (this.params.item) {
    const engName = this.params.item[0].toUpperCase() + this.params.item.slice(1);
    const id = `Building/${group}/${engName}`;
    item = buildings[id];
  }

  this.render(
    (new MenuUnique({
      hash: {
        items: menuItems,
        selected: item,
      },
    })).renderComponent(),
    { to: 'bottomMenu' }
  );
  
  if (item) {
    const queue = item.getQueue();
    this.render(
      new Building({
        hash: {
          building: item,
          submenu: menu,
          level: new ReactiveVar(queue ? queue.level : item.getCurrentLevel() + 1),
        }
      }).renderComponent(), 
      { to: 'content' }
    );
    this.render('empty', {to: 'item_submenu'});

    switch (menu) {
      case 'tournaments':
        this.render('colosseum', { to: 'item_submenu' });
        break;
      case 'bonus':
        this.render('pulsecatcher', {to: 'item_submenu'});
        break;
    }
  } else {
    this.render('empty', { to: 'content' });
  }
};

var bonusEvents = {
  'click .collectBonus.metals': function(e, t) {
    Meteor.call('getBonusResources', 'metals', function(error, result) {
      if (error) {
        Notifications.error('Нельзя получить бонусный металл', error.error);
      } else {
        Notifications.success('Бонусный металл получен', '+' + result);
      }
    });
  },

  'click .collectBonus.crystals': function(e, t) {
    Meteor.call('getBonusResources', 'crystals', function(error, result) {
      if (error) {
        Notifications.error('Нельзя получить бонусный кристалл', error.error);
      } else {
        Notifications.success('Бонусный кристалл получен', '+' + result);
      }
    });
  }
};

Template.overlay_menu.events(bonusEvents);

initBuildingSpecialMarketClient();
initBuildingSpecialColosseumClient();
initBuildingSpecialContainerClient();
initBuildingSpecialPulsecatcherClient();

};