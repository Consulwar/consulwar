import { Meteor } from 'meteor/meteor';

initEarthAdminClient = function() {
'use strict';

Template.adminReptileChange.helpers({
  army() {
    const zone = Game.EarthZones.getByName(this.zoneName);
    const zoneArmy = zone.enemyArmy ? zone.enemyArmy.reptiles.ground : {};

    const groundUnits = Game.Unit.items.reptiles.ground;

    return _(groundUnits).keys().map(unitName => ({
      engName: unitName,
      name: groundUnits[unitName].name,
      count: zoneArmy[unitName] || 0,
    }));
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

    _(Game.Cards.items.donate).keys().forEach((cardName) => {
      push({
        id: `cards.${cardName}`,
        name: Game.Cards.items.donate[cardName].name,
      });
    });

    push({ name: '----------------------------------------' });

    _(Game.Unit.items.army).keys().forEach((unitGroup) => {
      _(Game.Unit.items.army[unitGroup]).keys().forEach((unitName) => {
        push({
          id: `units.${unitGroup}.${unitName}`,
          name: Game.Unit.items.army[unitGroup][unitName].name,
        });
      });
    });

    push({ name: '----------------------------------------' });

    _(Game.House.items).keys().forEach((itemGroup) => {
      _(Game.House.items[itemGroup]).keys().forEach((itemName) => {
        push({
          id: `houseItems.${itemGroup}.${itemName}`,
          name: Game.House.items[itemGroup][itemName].name,
        });
      });
    });

    push({ name: '----------------------------------------' });

    _(Game.Artefacts.items).keys().forEach((artefactName) => {
      push({
        id: `resources.${artefactName}`,
        name: Game.Artefacts.items[artefactName].name,
      });
    });

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

const getInfoFromForm = function (elements) {
  const modifier = {};
  const units = {};

  elements.forEach((element) => {
    const id = element.attr('data-id');
    const count = parseInt(element.find('input').val(), 10);

    modifier[`enemyArmy.reptiles.ground.${id}`] = Math.max(0, count);

    if (count !== 0) {
      units[id] = count;
    }
  });

  return {
    modifier,
    units,
  };
};

Template.adminReptileChange.events({
  'click .change'(event, templateInstance) {
    const elements = templateInstance.$('.armies li');
    const { modifier, units } = getInfoFromForm(elements);

    Meteor.call('earth.setReptileArmy', this.zoneName, modifier, units, false, function(err) {
      if (err) {
        Notifications.error('Не удалось изменить армию: ', err.error);
      } else {
        Notifications.success('Армия успешно изменена.');
      }
    });
  },

  'click .changeTurn'(event, templateInstance) {
    const elements = templateInstance.$('.armies li');
    const { modifier, units } = getInfoFromForm(elements);

    Meteor.call('earth.setReptileArmy', this.zoneName, modifier, units, true, function(err) {
      if (err) {
        Notifications.error('Не удалось внести изменения: ', err.error);
      } else {
        Notifications.success('Армия успешно добавлена на следующий ход.');
      }
    });
  },

  'click .setBonus'(event, templateInstance) {
    const element = templateInstance.$('.bonusProfit');
    const id = templateInstance.$(element).find(':selected').attr('name');
    const count = parseInt(templateInstance.$(element).find('input').val(), 10);

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