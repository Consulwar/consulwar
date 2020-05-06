import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import User from '/imports/modules/User/server/User';
import Log from '/imports/modules/Log/server/Log';
import Game from '/moduls/game/lib/main.game';
import Artifacts from '/imports/content/Resource/Artifact/server';

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
const PENAL_TIMEOUT = 60 * 60;
const SLOTS_TOTAL = 8;

Meteor.methods({
  'puzzle.create'({ sequence, reward }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'puzzle.create', user });

    check(sequence, [{
      place: Match.Integer,
      plasmoid: String,
      hint: String,
      text: String,
    }]);
    check(reward, Match.Integer);

    if (reward < 0) {
      throw new Meteor.Error('Награда недостаточно щедра');
    }

    const slots = (new Array(SLOTS_TOTAL)).fill(0);

    sequence.forEach((item) => {
      if (!PLASMOIDS.includes(item.plasmoid)) {
        throw new Meteor.Error('В пазле можно использовать только плазмоиды');
      }
      if (item.place < 0 || item.place > 7) {
        throw new Meteor.Error(`В пазле есть только ${SLOTS_TOTAL} позиций`);
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
      maxMoves: 0,
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

    const chatMessage = {
      room_id: room._id,
      user_id: user._id,
      username: user.username,
      alliance: user.alliance,
      rating: user.rating,
      timestamp: Game.getCurrentTime(),
      data: {
        type: 'puzzle',
        id: puzzleId,
        reward,
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
      `задал загадку на ${reward} ГГК`,
    );
  },

  'puzzle.getHints'({ puzzleId }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'puzzle.getHints', user });

    check(puzzleId, String);

    const puzzle = PuzzleCollection.findOne({ _id: puzzleId });
    const solutions = puzzle.solutions || {};
    const solution = solutions[user.username] || { successMoves: 0 };

    const result = puzzle.sequence.slice(0, solution.successMoves + 1);
    if (solution.successMoves < SLOTS_TOTAL) {
      result[result.length - 1] = { hint: result[result.length - 1].hint };
    }

    return result;
  },

  'puzzle.insert'({ puzzleId, place, plasmoid }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'puzzle.insert', user });

    check(puzzleId, String);
    check(place, Match.Integer);
    check(plasmoid, String);

    if (place < 0 || place > 7) {
      throw new Meteor.Error(`В пазле есть только ${SLOTS_TOTAL} позиций`);
    }
    if (!PLASMOIDS.includes(plasmoid)) {
      throw new Meteor.Error('В пазле можно использовать только плазмоиды');
    }

    const puzzle = PuzzleCollection.findOne({ _id: puzzleId });
    if (puzzle.winner != null) {
      throw new Meteor.Error('Пазл уже собран');
    }

    const solutions = puzzle.solutions || {};
    const solution = solutions[user.username] || { successMoves: 0 };
    if (solution.timeout > Game.getCurrentTime()) {
      throw new Meteor.Error('Штрафной таймаут ещё не закончился');
    }

    const plasmoidInfo = Artifacts[plasmoid];
    const price = { [plasmoidInfo.engName]: 1 };
    if (!Game.Resources.has({
      resources: price,
      user,
    })) {
      throw new Meteor.Error('Недостаточно плазмоидов');
    }
    Game.Resources.spend(price);

    const nextMove = puzzle.sequence[solution.successMoves];
    const modifier = { $set: {} };
    let result = false;
    let { successMoves } = solution;
    if (place === nextMove.place && plasmoid === nextMove.plasmoid) {
      successMoves += 1;
      modifier.$set[`solutions.${user.username}.successMoves`] = successMoves;
      if (successMoves > puzzle.maxMoves) {
        modifier.$set.maxMoves = successMoves;
      }
      result = true;
    } else {
      modifier.$set[`solutions.${user.username}.timeout`] = Game.getCurrentTime() + PENAL_TIMEOUT;
    }
    if (successMoves === SLOTS_TOTAL) {
      modifier.$set.winner = user.username;
    }
    const updated = PuzzleCollection.update(
      { _id: puzzle._id, winner: null },
      modifier,
    );

    if (successMoves === SLOTS_TOTAL) {
      if (updated) {
        Game.Resources.add({ credits: puzzle.reward });
        Game.Broadcast.add(
          user.username,
          `отгадал загадку на ${puzzle.reward} ГГК`,
        );
      } else {
        throw new Meteor.Error('Чуть-чуть не успели :(');
      }
    }

    return result;
  },
});
