initMailClient = function () {
'use strict';

initMailLib();

// Subscription returns one record
// Used at Game.Mail.hasUnread() method
var subscription = Meteor.subscribe('privateMailUnread');

var observer = null;
var isLoading = new ReactiveVar(false);
var mailPrivate = new ReactiveVar(null);

Game.Mail.Collection.find({}).observeChanges({
  added: function(id, fields) {
    if (subscription.ready()) {
      Game.showDesktopNotification('Консул, вам письмо!', {
        path: Router.path('mail', {group: 'communication', page: 1})
      });
    }
  }
});

Game.Mail.showPage = function() {
  var hash = this.params.hash;
  var page = parseInt( this.params.page, 10 );
  var count = 20;

  if (page && page > 0) {
    isLoading.set(true);
    Meteor.call('mail.getPrivatePage', page, count, function(err, data) {
      if (!err) {
        isLoading.set(false);
        mailPrivate.set(data);
      }
    });

    var test = this.render('mail', {
      to: 'content',
      data: {
        page: page,
        count: count,
        mail: mailPrivate,
        letter: new ReactiveVar(null),
        isRecipientOk: new ReactiveVar(false),
        isLoading: isLoading
      }
    });
  }
};

Template.mail.onRendered(function() {
  // save template instance
  var template = this;

  // refresh on new unread message
  observer = Game.Mail.Collection.find({}).observeChanges({
    added: function(id, fields) {
      if (template.data.page == 1) {
        reloadPageData(template);
      }
    }
  });

  // run this function each time hash changes
  this.autorun(function() {
    var hash = Router.current().getParams().hash;

    // hide all windows
    closeMessages(template);

    if (hash) {
      // read letter
      if (hash.indexOf('read') === 0) {
        readLetter(hash.substr('read'.length + 1), template);
      }
      // compose letter
      else if (hash.indexOf('compose') === 0) {
        composeLetter(decodeURIComponent(hash.substr('compose'.length + 1)), template);
      }
      // reply
      else if (hash.indexOf('reply') === 0) {
        replyLetter(template.data.letter.get(), template);
      }
    }
  });
});

Template.mail.onDestroyed(function() {
  if (observer) {
    observer.stop();
    observer = null;
  }
});

var reloadPageData = function(t) {
  t.data.isLoading.set(true);
  Meteor.call('mail.getPrivatePage', t.data.page, t.data.count, function(err, data) {
    t.data.isLoading.set(false);
    if (err) {
      Notifications.error('Не удалось загрузить письма', err.error);
    } else {
      t.data.mail.set(data);
    }
  });
};

var closeMessages = function(t) {
  $('.over').empty();
  t.$('.battle_letter').hide();
  t.$('.letter').hide();
  t.$('form').hide();
};

var readLetter = function(id, t) {
  t.data.isLoading.set(true);
  Meteor.call('mail.getLetter', id, function(err, letter) {
    t.data.isLoading.set(false);
    
    if (err) {
      Notifications.error('Не удалось загрузить письмо', err.error);
      return;
    }

    t.data.letter.set(letter);

    // hack for status update without request
    if (letter.to == Meteor.userId() && letter.status == game.Mail.status.unread) {
      letter.status = game.Mail.status.read;
      var letters = t.data.mail.get();
      if (letters) {
      for (var i = 0; i < letters.length; i++)
        if (letters[i]._id == letter._id) {
          letters[i].status = game.Mail.status.read;
          t.data.mail.set(letters);
          break;
        }
      }
    }

    if (letter.type == 'fleetbattle') {
      t.$('.battle_letter').show();
    } else if (letter.type == 'battleonearth') {
      t.$('.battle_on_earth_letter').show();
    } else if (letter.type == 'quiz') {
      
      Meteor.call('getQuiz', letter.text, function(err, result) {
        if (err) {
          Notifications.error('Не удалось открыть опрос', err.error);
        } else {
          Blaze.renderWithData(
            Template.quiz, 
            {
              quiz: result,
              questionNum: 0
            }, 
            $('.over')[0]
          );
        }
      });
    } else {
      t.$('.letter').show();
    }
  });
};

var replyLetter = function(letter, t) {
  if (letter) {
    // parse source recipient
    t.$('form .recipient').val(letter.from == Meteor.userId() ? letter.recipient : letter.sender);

    // parse source subject
    var subject = letter.subject;
    var match = subject.match(/Re: /i);
    if (match) {
      subject = 'Re (1): ' + subject.substr(match[0].length, subject.length);
    } else {
      match = subject.match(/Re \((\d+)\): /i);
      if (match) {
        var n = parseInt( match[1] ) + 1;
        subject = 'Re (' + n + '): ' + subject.substr(match[0].length, subject.length);
      } else {
        subject = 'Re: ' + subject; 
      }
    }
    t.$('form .subject').val(subject);

    // parse source message
    var quote = '\n'.repeat(2) + '<blockquote>' + letter.text + '</blockquote>' + '\n';
    if (quote.length < 5000) {
      t.$('form textarea').val(quote);
    }
  }

  t.$('form').show();
  checkUsername(t);

  var textarea = t.find('form textarea');
  textarea.focus();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 0;
};

var composeLetter = function(to, t) {
  t.$('form').show();
  t.$('form .recipient').val(to);
  checkUsername(t);
};

var checkUsername = function(t) {
  var username = t.$('form .recipient').val();
  if (username && username.length > 0) {
    Meteor.call('user.checkUsernameExists', username, function(err, result) {
      if (!err) {
        t.data.isRecipientOk.set(result);
      }
    });
  } else {
    t.data.isRecipientOk.set(false);
  }
};

Template.mail.helpers({
  isLoading: function() { return this.isLoading.get(); },
  countTotal: function() { return Game.Statistic.getUserValue('mail.current'); },
  mail: function() { return this.mail.get(); },
  letter: function() { return this.letter.get(); },
  userId: function() { return Meteor.userId(); },
  isRecipientOk: function() { return this.isRecipientOk.get(); },

  isAdmin: function() {
    var user = Meteor.user();
    return (user && ['admin', 'helper'].indexOf(user.role) != -1);
  },

  letterName: function(letter) {
    return letter.from == Meteor.userId() ? '-> ' + letter.recipient : letter.sender;
  },

  letterStatus: function(letter) {
    if (letter.sentCount) {
      return 'Прочитано ' + letter.readCount + ' из ' + letter.sentCount;
    }
    return letter.status == game.Mail.status.read ? 'Прочитано': '';
  },

  canComplain: function(letter) {
    return (letter && _.isString(letter.from) && letter.from != Meteor.userId()) ? true : false;
  },

  canReply: function(letter) {
    return (letter && _.isString(letter.from)) ? true : false;
  },

  dailyQuest: function() {
    var user = Meteor.user();
    var dailyQuest = Game.Quest.getDaily();

    if (dailyQuest) {
      return {
        to: user._id,
        from: 0,
        sender: Game.Persons[dailyQuest.who || 'tamily'].name,
        recipient: user.username,
        name: Game.Persons[dailyQuest.who || 'tamily'].name,
        subject: dailyQuest.name,
        timestamp: dailyQuest.startTime,
        status: dailyQuest.status == Game.Quest.status.FINISHED ? 'Выполнено' : ''
      };
    }

    return null;
  },

  army: function(start, result) {
    return _.map(start, function(value, key) {
      return {
        name: Game.Unit.items.army.ground[key].name,
        engName: key,
        startCount: value,
        count: result[key],
        object: Game.Unit.items.army.ground[key]
      };
    });
  },

  reptiles: function(start, result) {
    return _.map(start, function(value, key) {
      return {
        name: Game.Unit.items.reptiles.rground[key].name,
        engName: key,
        startCount: value,
        count: result[key],
        object: Game.Unit.items.reptiles.rground[key]
      };
    });
  }
});

Template.mail.events({
  // Read letter
  'click tr:not(.header,.from_tamily)': function(e, t) {
    Router.go('mail', { page: t.data.page }, { hash: 'read/' + e.currentTarget.dataset.id });
  },

  // Open daily quest
  'click tr.from_tamily': function(e, t) {
    Game.Quest.showDailyQuest();
  },

  // Compose letter
  'click .new_message': function(e, t) {
    if (Meteor.user().rating >= 25000) {
      Router.go('mail', { page: t.data.page }, { hash: 'compose' });
    }
  },

  // Reply to letter
  'click button.reply': function(e, t) {
    Router.go('mail', { page: t.data.page }, { hash: 'reply' });
  },

  // Go back
  'click button.back': function(e, t) {
    e.preventDefault();
    window.history.back();
  },

  // Checkboxes
  'click td:first-child': function(e, t) {
    e.stopPropagation();
    var checkbox = t.$(e.target).find('input');
    checkbox.prop('checked', checkbox.prop('checked') === true ? false: true);
    if (t.$('td input[type="checkbox"]:checked').length > 0) {
      t.$('.delete_selected').removeClass('disabled');
    } else {
      t.$('.delete_selected').addClass('disabled');
      t.$('th input[type="checkbox"]').prop('checked', false);
    }
  },

  'change th input[type="checkbox"]': function(e, t) {
    t.$('input[type="checkbox"]').prop('checked', t.$(e.target).prop('checked'));
    if (t.$('td input[type="checkbox"]:checked').length > 0) {
      t.$('.delete_selected').removeClass('disabled');
    } else {
      t.$('.delete_selected').addClass('disabled');
      t.$('th input[type="checkbox"]').prop('checked', false);
    }
  },

  // Delete selected letters
  'click .delete_selected': function(e, t) {
    if ($(e.currentTarget).hasClass('disabled')) {
      return;
    }

    var selected = t.$('td input[type="checkbox"]:checked');
    var ids = [];

    for (var i = 0; i < selected.length; i++) {
      ids.push(t.$(selected[i]).parents('tr').data('id'));
    }

    t.$('.delete_selected').addClass('disabled');
    t.$('th input[type="checkbox"]').prop('checked', false);
    
    if (ids) {
      Meteor.call('mail.removeLetters', ids, function(err, data) {
        if (err) {
          Notifications.error('Не удалось удалить письма', err.error);
        } else {
          for (var i = 0; i < selected.length; i++) {
            t.$(selected[i]).parents('tr').remove();
          }
          // all deleted then go previous page
          if (t.data.page > 1 && ids.length == t.data.mail.get().length) {
            Router.go('mail', { page: t.data.page - 1 });
          }
        }
      });
    }
  },

  // Show admin page
  'click .admin_page': function(e, t) {
    Router.go('mailAdmin', { page: 1 });
  },

  // Complain letter
  'click button.complain': function(e, t) {
    var letter = t.data.letter.get();
    if (letter) {
      // mark current as complaint
      letter.complaint = true;
      t.data.letter.set(letter);
      // send request
      Meteor.call('mail.complainLetter', letter._id, function(err, data) {
        if (err) {
          Notifications.error('Невозможно отправить жалобу', err.error);
          // request failed, so mark as not complaint
          letter.complaint = false;
          t.data.letter.set(letter);
        } else {
          Notifications.success('Жалоба отправлена');
        }
      });
    }
  },

  // Send letter
  'submit form': function(e, t) {
    e.preventDefault();

    // disable submit button
    t.$('input[type="submit"]').prop('disabled', true);
    t.data.isLoading.set(true);

    Meteor.call(
      'mail.sendLetter', 
      t.find('form .recipient').value, 
      t.find('form .subject').value, 
      t.find('form textarea').value,
      function(err, response) {
        // enable submit button
        t.$('input[type="submit"]').prop('disabled', false);
        t.data.isLoading.set(false);
        // check response
        if (!err) {
          e.currentTarget.reset();
          Notifications.success('Письмо отправлено');
          // if first page, reload data
          if (t.data.page == 1) {
            reloadPageData(t);
          }
          // go first page
          Router.go('mail', { page: 1 });
        } else {
          var errorMessage = err.error;
          if (_.isNumber(err.reason)) {
            errorMessage += ' до ' + Game.Helpers.formatDate(err.reason);
          }
          Notifications.error('Не удалось отправить письмо', errorMessage);
        }
      }
    );
  },

  // Check username
  'change input.recipient': function(e, t) {
    checkUsername(t);
  }
});

// ----------------------------------------------------------------------------
// Admin page
// ----------------------------------------------------------------------------

// TODO: Добавить вывод истории блокировки почты пользователя в админку.

var mailAdmin = new ReactiveVar(null);

Game.Mail.showAdminPage = function() {
  var hash = this.params.hash;
  var page = parseInt( this.params.page, 10 );
  var count = 20;

  if (page && page > 0) {
    isLoading.set(true);
    Meteor.call('mail.getAdminPage', page, count, function(err, data) {
      if (err) {
        Notifications.error(err.error);
      } else {
        isLoading.set(false);
        mailAdmin.set(data);
      }
    });

    this.render('mailAdmin', {
      to: 'content',
      data: {
        page: page,
        count: count,
        mail: mailAdmin,
        letter: new ReactiveVar(null),
        isLoading: isLoading
      }
    });
  }
};

Template.mailAdmin.onRendered(function() {
  // save template instance
  var template = this;

  // run this function each time hash changes
  this.autorun(function() {
    var hash = Router.current().getParams().hash;

    // hide all windows
    closeMessages(template);

    if (hash) {
      // read letter
      if (hash.indexOf('read') === 0) {
        adminReadLetter(hash.substr('read'.length + 1), template);
      }
    }
  });
});

var adminReadLetter = function(id, t) {
  t.data.isLoading.set(true);
  Meteor.call('mail.getLetter', id, function(err, letter) {
    t.data.isLoading.set(false);
    if (err) {
      Notifications.error(err.error);
    } else {
      t.data.letter.set(letter);
      t.$('.letter').show();
    }
  });
};

Template.mailAdmin.helpers({
  isLoading: function() { return this.isLoading.get(); },
  countTotal: function() { return Game.Statistic.getSystemValue('mail.complaint'); },
  mail: function() { return this.mail.get(); },
  letter: function() { return this.letter.get(); }
});

Template.mailAdmin.events({
  'click tr:not(.header)': function(e, t) {
    Router.go('mailAdmin', { page: t.data.page }, { hash: 'read/' + e.currentTarget.dataset.id });
  },

  'click button.back': function(e, t) {
    e.preventDefault();
    window.history.back();
  },

  'click button.block': function(e, t) {
    var letter = t.data.letter.get();
    if (!letter) {
      return;
    }

    var username = e.currentTarget.dataset.username;

    Game.showInputWindow('Заблокировать почту для пользователя ' + username, 'Нарушение правил', function(reason) {
      if (!reason) {
        return;
      }

      reason.trim();
      if (reason.length === 0) {
        Notifications.error('Не указана причина блокировки!');
        return;
      }

      Game.showInputWindow('Укажите время блокировки в секундах', '86400', function(time) {
        if (!time) {
          return;
        }

        time = parseInt( time, 10 );

        if (time <= 0) {
          Notifications.error('Не задано время блокировки');
          return;
        }

        Meteor.call('mail.blockUser', {
          username: username,
          time: time,
          reason: reason,
          letterId: letter._id
        });

        var resolution = (letter.sender == username)
          ? game.Mail.complain.senderBlocked
          : game.Mail.complain.recipientBlocked;

        Meteor.call('mail.resolveComplaint', letter._id, resolution, reason);

        Router.go('mailAdmin', { page: t.data.page });
        Notifications.success('Пользователь ' + username + ' заблокирован');
      });
    });
  },

  'click button.cancel': function(e, t) {
    var letter = t.data.letter.get();
    if (!letter) {
      return;
    }

    Game.showInputWindow('Укажите причину отклонения жалобы', 'Нарушений не найдено', function(reason) {
      if (!reason) {
        return;
      }

      reason = reason.trim();
      if (reason.length === 0) {
        Notifications.error('Не указана причина отклонения жалобы!');
        return;
      }

      Meteor.call('mail.resolveComplaint', letter._id, game.Mail.complain.canceled, reason);

      Router.go('mailAdmin', { page: t.data.page });
      Notifications.success('Жалоба отклонена');
    });
  }
});

initMailQuizClient();

};