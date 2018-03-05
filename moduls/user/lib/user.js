import SpecialEffect from '/imports/modules/Effect/lib/SpecialEffect';

Meteor.startup(function () {
'use strict';

Game.User = {
  getVotePower: function(user) {
    user = user || Meteor.user();
    var bonus = user.votePowerBonus || 0;
    var level = Game.User.getLevel( user.rating );

    const power = SpecialEffect.applyTo({
      target: { id: 'Unique/VotePower' },
      obj: { power: level + bonus },
      hideEffects: true,
      userId: user._id,
    }).power;
    
    return power;
  },

  iconPath: function(user) {
    if (user.settings && user.settings.chat && user.settings.chat.icon) {
      return user.settings.chat.icon;
    }
    return 'common/1';
  },

  levels: [
    { rating: 0, name: 'Новичок' },
    { rating: 25000, name: 'Консул' },
    { rating: 150000, name: 'Правитель' },
    { rating: 750000, name: 'Император' },
    { rating: 5000000, name: 'Великий' },
    { rating: 40000000, name: 'Высший' },
    { rating: 200000000, name: 'Непогрешимый' },
    { rating: 1000000000, name: 'Лик всемогущего' }
  ],

  getLevel: function(rating) {
    rating = arguments.length === 0 ? Meteor.user().rating : rating;
    rating = (rating && _.isNumber(rating)) ? rating : 0;

    for (var level = 0; level < this.levels.length - 1; level++) {
      if (rating < this.levels[level + 1].rating) {
        return level;
      }
    }

    return this.levels.length - 1;
  },

  getRatingForLevel: function(level) {
    level = _.isNumber(level) ? level : 0;
    return this.levels[level].rating;
  },

  getMaxLevel: function() {
    return this.levels.length - 1;
  },

  getLevelName: function(rating) {
    rating = arguments.length === 0 ? Meteor.user().rating : rating;
    return this.levels[this.getLevel(rating)].name;
  },

  haveVerifiedEmail: function() {
    var user = Meteor.user();

    if (!user || !user.emails) {
      return false;
    }

    for (var i = 0; i < user.emails.length; i++) {
      if (user.emails[i].verified) {
        return true;
      }
    }

    return false;
  }
};

});