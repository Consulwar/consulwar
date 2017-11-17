import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import Log from '/imports/modules/Log/server/Log';
import persons from '/imports/content/Person/server';

const checkUser = function(user) {
  if (!(user && user._id)) {
    throw new Meteor.Error('Требуется авторизация');
  }

  if (user.blocked === true) {
    throw new Meteor.Error('Аккаунт заблокирован.');
  }
};

const checkSkinExists = function({
  personId,
  person = persons[personId],
  skinId,
}) {
  if (!person) {
    throw new Meteor.Error('Чей, простите, скин купить собрались?');
  }

  if (person.skin && !person.skin[skinId]) {
    throw new Meteor.Error('Вы можете закать данный скин по телефону 8 800 … 35 35');
  }
};

Meteor.methods({
  'Person.setActiveSkins'({
    personId,
    skinIds,
  }) {
    const user = Meteor.user();
    checkUser(user);

    Log.method.call(this, { name: 'Person.setActiveSkins', user });

    check(personId, String);
    check(skinIds, [String]);
    const person = persons[personId];
    const availableSkins = person.getAvailableSkins({ user });

    skinIds.forEach((skinId) => {
      checkSkinExists({
        person,
        skinId,
      });

      if (availableSkins.indexOf(skinId) === -1) {
        throw new Meteor.Error('Неплохо бы сперва его преобрести :-)');
      }
    });

    person.activateSkins({
      userId: user._id,
      ids: skinIds.length ? _(skinIds).uniq() : ['default'],
    });
  },

  'Person.buySkin'({
    personId,
    skinId,
  }) {
    const user = Meteor.user();
    checkUser(user);

    Log.method.call(this, { name: 'Person.buySkin', user });

    check(personId, String);
    check(skinId, String);

    const person = persons[personId];
    checkSkinExists({
      person,
      skinId,
    });

    if (!person.skin[skinId].price) {
      throw new Meteor.Error('Ни за какие коврижки, чел');
    }

    const availableSkins = person.getAvailableSkins({ user });

    if (availableSkins.indexOf(skinId) !== -1) {
      throw new Meteor.Error('Вы хотите купить второй комплект?');
    }

    if (!Game.Resources.has({
      user,
      resources: person.skin[skinId].price,
    })) {
      throw new Meteor.Error('Недостаточно ресурсов');
    }

    Game.Resources.spend(person.skin[skinId].price, user._id);

    Game.Payment.Expense.log(person.skin[skinId].price.credits, 'personSkin', {
      personId,
      skinId,
    });

    person.addSkin({ userId: user._id, id: skinId });
  },
});
