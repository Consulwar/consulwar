import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import User from '/imports/modules/User/server/User';
import Log from '/imports/modules/Log/server/Log';
import Game from '/moduls/game/lib/main.game';

import PuzzleCollection from '../lib/PuzzleCollection';

const PLASMOIDS = [
  'Resource/Artifact/White/SilverPlasmoid',
  'Resource/Artifact/Green/EmeraldPlasmoid',
  'Resource/Artifact/Blue/SapphirePlasmoid',
  'Resource/Artifact/Purple/AmethystPlasmoid',
  'Resource/Artifact/Orange/TopazPlasmoid',
  'Resource/Artifact/Red/RubyPlasmoid',
];

const PUZZLE_PRICE_DGC = 500;

Meteor.methods({
  'puzzle.create'({ sequence, reward }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'puzzle.create', user });

    check(sequence, [{ place: Match.Integer, plasmoid: String, hint: String }]);
    check(reward, Match.Integer);

    if (reward < 0) {
      throw new Meteor.Error('Награда недостаточно щедра');
    }

    const slots = (new Array(8)).fill(0);

    sequence.forEach((item) => {
      if (!PLASMOIDS.includes(item.plasmoid)) {
        throw new Meteor.Error('В пазле можно использовать только плазмоиды');
      }
      if (item.place < 0 || item.place > 7) {
        throw new Meteor.Error('В пазле есть только 8 позиций');
      }
      slots[item.place] += 1;
    });

    if (!slots.every(count => count === 1)) {
      throw new Meteor.Error('Каждый слот нужно заполнить один раз');
    }

    const price = { credits: reward + PUZZLE_PRICE_DGC };
    if (!Game.Resources.has({
      resources: price,
      user,
    })) {
      throw new Meteor.Error('Недостаточно ГГК');
    }

    const puzzle = {
      sequence,
      reward,
    };
    const puzzleId = PuzzleCollection.insert(puzzle);

    Game.Resources.spend(price);

    if (price.credits) {
      Game.Payment.Expense.log(price.credits, 'puzzle', {
        itemId: puzzleId,
      });
    }

    const room = Game.Chat.Room.Collection.findOne({
      name: 'general',
      deleted: { $ne: true },
    });

    const message = `задал загадку на ${reward} ГГК`;

    const chatMessage = {
      room_id: room._id,
      user_id: user._id,
      username: user.username,
      alliance: user.alliance,
      rating: user.rating,
      message,
      timestamp: Game.getCurrentTime(),
      data: {
        type: 'puzzle',
        id: puzzleId,
      },
    };

    if (user.role) {
      chatMessage.role = user.role;
    }

    if (user.chatTitle) {
      chatMessage.chatTitle = user.chatTitle;
    }

    if (user.settings && user.settings.chat && user.settings.chat.icon) {
      chatMessage.iconPath = user.settings.chat.icon;
    }

    Game.Chat.Messages.Collection.insert(chatMessage);

    Game.Broadcast.add(
      user.username,
      message,
    );
  },
});
