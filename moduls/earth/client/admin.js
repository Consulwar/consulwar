import { Meteor } from 'meteor/meteor';

initEarthAdminClient = function() {
'use strict';

Template.adminReptileChange.helpers({
  army() {
    const zone = Game.EarthZones.getByName(this.zoneName);
    const zoneArmy = zone.enemyArmy ? zone.enemyArmy.reptiles.ground : {};

    let result = [];

    const groundUnits = Game.Unit.items.reptiles.ground;
    for (let unitName in groundUnits) {
      if (groundUnits.hasOwnProperty(unitName)) {
        result.push({
          engName: unitName,
          name: groundUnits[unitName].name,
          count: zoneArmy[unitName] || 0,
        });
      }
    }

    return result;
  },

  options() {
    const zone = Game.EarthZones.getByName(this.zoneName);
    const bonus = zone.bonus || {};

    const result = [];

    const push = function (obj) {
      obj.selected = (obj.id && obj.id === bonus.id) ? 'selected' : '';

      result.push(obj);
    };

    push({ name: '----------------------------------------' });

    push({ id: 'votePower', name: 'Сила голоса' });

    push({ name: '----------------------------------------' });

    push({ id: 'containers.defaultContainer', name: 'Бесплатный контейнер' });

    push({ name: '----------------------------------------' });

    push({ id: 'resources.humans', name: 'Люди' });
    push({ id: 'resources.metals', name: 'Металл' });
    push({ id: 'resources.crystals', name: 'Кристалл' });
    push({ id: 'resources.honor', name: 'Честь' });
    push({ id: 'resources.credits', name: 'ГГК' });

    push({ name: '----------------------------------------' });

    for (let cardName in Game.Cards.items.donate) {
      push({
        id: 'cards.' + cardName,
        name: Game.Cards.items.donate[cardName].name,
      });
    }

    push({ name: '----------------------------------------' });

    for (let unitGroup in Game.Unit.items.army) {
      for (let unitName in Game.Unit.items.army[unitGroup]) {
        push({
          id: 'units.' + unitGroup + '.' + unitName,
          name: Game.Unit.items.army[unitGroup][unitName].name,
        });
      }
    }

    push({ name: '----------------------------------------' });

    for (let itemGroup in Game.House.items) {
      for (let itemName in Game.House.items[itemGroup]) {
        push({
          id: 'houseItems.' + itemGroup + '.' + itemName,
          name: Game.House.items[itemGroup][itemName].name,
        });
      }
    }

    push({ name: '----------------------------------------' });

    for (let artefactName in Game.Artefacts.items) {
      push({
        id: 'resources.' + artefactName,
        name: Game.Artefacts.items[artefactName].name,
      });
    }

    return result;
  },

  currentValue() {
    const zone = Game.EarthZones.getByName(this.zoneName);
    const bonus = zone.bonus;
    if (bonus) {
      return bonus.count;
    }
    return 0;
  },
});

const fillInfo = function (elements, modifier, units) {
  for (let i = 0; i < elements.length; i += 1) {
    const id = $(elements[i]).attr('data-id');
    const count = parseInt($(elements[i]).find('input').val(), 10);

    modifier[`enemyArmy.reptiles.ground.${id}`] = Math.max(0, count);

    if (count !== 0) {
      units[id] = count;
    }
  }
};

Template.adminReptileChange.events({
  'click .close'(event, templateInstance) {
    Blaze.remove(templateInstance.view);
  },

  'click .change'() {
    const modifier = {};
    const units = {};

    const elements = $('.armies li');

    fillInfo(elements, modifier, units);

    Meteor.call('earth.setReptileArmy', this.zoneName, modifier, units, false, function(err) {
      if (err) {
        Notifications.error('Не удалось изменить армию: ', err.error);
      } else {
        Notifications.success('Армия успешно изменена.');
      }
    });
  },

  'click .changeTurn'() {
    const modifier = {};
    const units = {};

    const elements = $('.armies li');

    fillInfo(elements, modifier, units);

    Meteor.call('earth.setReptileArmy', this.zoneName, modifier, units, true, function(err) {
      if (err) {
        Notifications.error('Не удалось внести изменения: ', err.error);
      } else {
        Notifications.success('Армия успешно добавлена на следующий ход.');
      }
    });
  },

  'click .setBonus'() {
    const element = $('.bonusProfit');
    const id = $(element).find(':selected').attr('name');
    const count = parseInt($(element).find('input').val(), 10);

    if (id && count > 0) {
      Meteor.call('earth.setBonus', this.zoneName, { id, count }, function(err) {
        if (err) {
          Notifications.error('Не удалось установить бонус: ', err.error);
        } else {
          Notifications.success('Бонус успешно установлен.');
        }
      });
    }
  },

  'click .deleteBonus'() {
    Meteor.call('earth.setBonus', this.zoneName, null, function(err) {
      if (err) {
        Notifications.error('Не удалось удалить бонус: ', err.error);
      } else {
        Notifications.success('Бонус успешно удален.');
      }
    });
  },
});

};