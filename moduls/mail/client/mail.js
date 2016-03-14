initMailClient = function () {

initMailLib();

// Subscription returns one record
// Used at Game.Mail.hasUnread() method
Meteor.subscribe('privateMailUnread');

var isLoading = new ReactiveVar(false);
var mailPrivate = new ReactiveVar(null);

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
}

Template.mail.onRendered(function() {
	// save template instance
	var template = this;

	// run this function each time hash changes
	this.autorun(function() {
		var hash = Router.current().getParams().hash;

		// hide all windows
		closeMessages(template);

		if (hash) {
			// read letter
			if (hash.indexOf('read') == 0) {
				readLetter(hash.substr('read'.length + 1), template);
			}
			// show quest
			else if (hash.indexOf('quest') == 0) {
				showDailyQuest(template);
			}
			// compose letter
			else if (hash.indexOf('compose') == 0) {
				composeLetter(hash.substr('compose'.length + 1), template);
			}
			// reply
			else if (hash.indexOf('reply') == 0) {
				replyLetter(template.data.letter.get(), template);
			}
		}
	});
});

var closeMessages = function(t) {
	$('.over').empty();
	t.$('.battle_letter').hide();
	t.$('.letter').hide();
	t.$('form').hide();
}

var readLetter = function(id, t) {
	t.data.isLoading.set(true);
	Meteor.call('mail.getLetter', id, function(err, letter) {
		t.data.isLoading.set(false);

		if (err) {
			Notifications.error(err.error);
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
				Blaze.renderWithData(
					Template.quiz, 
					{
						id: result._id,
						userAnswer: result.userAnswer,
						who: result.who || 'psm',
						type: 'quiz',
						title: result.name, 
						text: result.text, 
						options: $.map(result.options, function(value, name) {
							return {
								name: name,
								text: value,
								value: result.result[name] || 0,
								totalVotes: result.totalVotes,
							};
						}),
						totalVotes: result.totalVotes,
						votePower: Game.User.getVotePower(),
						canVote: !result.userAnswer // || !Game.User.getVotePower() ? false : true
					}, 
					$('.over')[0]
				)
			})
		} else {
			t.$('.letter').show();
		}
	});
}

var showDailyQuest = function(t) {
	var dailyQuest = Game.Quest.getDaily();

	if (dailyQuest.status == Game.Quest.status.INPROGRESS) {
		// show inprogress daily quest
		t.data.isLoading.set(true);
		Meteor.call('quests.getDailyInfo', function(err, quest) {
			t.data.isLoading.set(false);
			Blaze.renderWithData(
				Template.quest, 
				{
					who: quest.who || 'tamily',
					type: 'daily',
					title: quest.name, 
					text: quest.text, 
					options: $.map(quest.answers, function(text, name) {
						return {
							name: name,
							text: text,
							mood: 'neutral'
						};
					}),
					isPrompt: true
				}, 
				$('.over')[0]
			);
		});
	} else {
		// show finished daily quest
		Blaze.renderWithData(
			Template.quest, 
			{
				who: dailyQuest.who || 'tamily',
				type: 'daily',
				title: dailyQuest.name, 
				text: dailyQuest.result
			}, 
			$('.over')[0]
		);
	}
}

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
	checkLogin(t);

	var textarea = t.find('form textarea');
	textarea.focus();
	textarea.selectionStart = 0;
	textarea.selectionEnd = 0;
}

var composeLetter = function(to, t) {
	t.$('form').show();
	t.$('form .recipient').val(to);
	checkLogin(t);
}

var checkLogin = function(t) {
	var login = t.$('form .recipient').val();
	if (login && login.length > 0) {
		Meteor.call('user.checkLoginExists', login, function(err, result) {
			t.data.isRecipientOk.set(result);
		});
	} else {
		t.data.isRecipientOk.set(false);
	}
}

Template.mail.helpers({
	isLoading: function() {
		return this.isLoading.get();
	},

	countTotal: function() {
		return Game.Statistic.getUserValue('totalMail');
	},

	mail: function() {
		return this.mail.get();
	},

	letter: function() {
		return this.letter.get();
	},

	letterName: function(letter) {
		return letter.from == Meteor.userId() ? '-> ' + letter.recipient : letter.sender;
	},

	letterStatus: function(letter) {
		if (letter.sentCount) {
			return 'Прочитано ' + letter.sentCount + ' из ' + letter.readCount;
		}
		return letter.status == game.Mail.status.read ? 'Прочитано': '';
	},

	userId: function() {
		return Meteor.userId();
	},

	isRecipientOk: function() {
		return this.isRecipientOk.get();
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
				recipient: user.login,
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
			}
		})
	},

	reptiles: function(start, result) {
		return _.map(start, function(value, key) {
			return {
				name: Game.Unit.items.reptiles.rground[key].name,
				engName: key,
				startCount: value,
				count: result[key],
				object: Game.Unit.items.reptiles.rground[key]
			}
		})
	}
});

Template.mail.events({
	// Read letter
	'click tr:not(.header,.from_tamily)': function(e, t) {
		Router.go('mail', { page: t.data.page }, { hash: 'read/' + e.currentTarget.dataset.id });
	},

	// Open daily quest
	'click tr.from_tamily': function(e, t) {
		Router.go('mail', { page: t.data.page }, { hash: 'quest' });
	},

	// Compose letter
	'click .new_message': function(e, t) {
		Router.go('mail', { page: t.data.page }, { hash: 'compose' });
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
		checkbox.prop('checked', checkbox.prop('checked') == true ? false: true);
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
				if (!err) {
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
						Meteor.call('mail.getPrivatePage', 1, t.data.count, function(err, data) {
							if (!err) {
								t.data.mail.set(data);
							}
						});
					}
					// go first page
					Router.go('mail', { page: 1 });
				} else {
					Notifications.error('Невозможно отправить письмо', err.error);
				}
			}
		);
	},

	// Check login
	'change input.recipient': function(e, t) {
		checkLogin(t);
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
			if (!err) {
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
}

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
			if (hash.indexOf('read') == 0) {
				adminReadLetter(hash.substr('read'.length + 1), template);
			}
		}
	});
})

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
}

Template.mailAdmin.helpers({
	isLoading: function() {
		return this.isLoading.get();
	},

	countTotal: function() {
		return Game.Statistic.getSystemValue('totalMailComplaints');
	},

	mail: function() {
		return this.mail.get();
	},

	letter: function() {
		return this.letter.get();
	}
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

		var login = e.currentTarget.dataset.login;

		var reason = prompt('Заблокировать почту для пользователя ' + login, 'Нарушение правил');
		if (!reason) {
			return;
		}

		reason.trim();
		if (reason.length == 0) {
			Notifications.error('Не указана причина блокировки!');
			return;
		}

		var time = prompt('Укажите время блокировки в секундах', '86400');
		if (!time) {
			return;
		}

		time = parseInt( time, 10 );

		if (time <= 0) {
			Notifications.error('Не задано время блокировки');
			return;
		}

		Meteor.call('mail.blockUser', {
			login: login,
			time: time,
			reason: reason,
			letterId: letter._id
		});

		var resolution = (letter.sender == login)
			? game.Mail.complain.senderBlocked
			: game.Mail.complain.recipientBlocked;

		Meteor.call('mail.resolveComplaint', letter._id, resolution, reason);

		Router.go('mailAdmin', { page: t.data.page });
		Notifications.success('Пользователь ' + login + ' заблокирован');
	},

	'click button.cancel': function(e, t) {
		var letter = t.data.letter.get();
		if (!letter) {
			return;
		}

		var reason = prompt('Укажите причину отклонения жалобы', 'Нарушений не найдено');

		if (!reason) {
			return;
		}

		reason = reason.trim();
		if (reason.length == 0) {
			Notifications.error('Не указана причина отклонения жалобы!');
			return;
		}

		Meteor.call('mail.resolveComplaint', letter._id, game.Mail.complain.canceled, reason);

		Router.go('mailAdmin', { page: t.data.page });
		Notifications.success('Жалоба отклонена');
	}
});

initMailQuizClient();

}