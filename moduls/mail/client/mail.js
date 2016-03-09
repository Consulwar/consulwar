initMailClient = function () {

initMailLib();

// TODO: Каким-то образом получать непрочитанные письма или статус!
// Meteor.subscribe('privateMailUnread');

Game.Mail.showPage = function() {
	var page = parseInt( this.getParams().page, 10 );
	var count = 20;

	if (!page || page < 1) {
		Router.go('mail', { page: 1 } );
	} else {
		Meteor.subscribe('privateMailPage', page, count);
		this.render('mail', {
			to: 'content',
			data: {
				page: page,
				count: count,
				isRecipientOk: new ReactiveVar(false),
				letter: new ReactiveVar(null)
			}
		});
	}
}

Template.mail.helpers({
	countTotal: function() {
		return Meteor.user().totalMail;
	},

	mail: function() {
		var letters = Game.Mail.Collection.find({
			owner: Meteor.userId(),
			deleted: { $ne: true }
		}, {
			sort: { timestamp: -1 },
			limit: this.count
		}).fetch();

		/* Debug block
		var output = [];
		for (var i = 0; i < letters.length; i++) {
			output.push( letters[i].subject );
		}
		console.log(this.page, this.count, output, Game.Mail.Collection.find().fetch().length);
		*/

		for (var i = 0; i < letters.length; i++) {
			letters[i].name = letters[i].from == Meteor.userId() ? '-> ' + letters[i].recipient : letters[i].sender;
			letters[i].status = letters[i].status == game.Mail.status.read ? 'Прочитано': '';
		}

		// insert daily quest into letters
		if (this.page == 1) {
			var user = Meteor.user();
			var dailyQuest = Game.Quest.getDaily();

			if (dailyQuest) {
				var quest = {
					to: user._id,
					from: 0,
					sender: Game.Persons[dailyQuest.who || 'tamily'].name,
					recipient: user.login,
					name: Game.Persons[dailyQuest.who || 'tamily'].name,
					subject: dailyQuest.name,
					timestamp: dailyQuest.startTime,
					status: dailyQuest.status == Game.Quest.status.FINISHED ? 'Выполнено' : ''
				};

				letters.unshift(quest); // always on top
			}
		}

		return letters;
	},

	letter: function() {
		return this.letter.get();
	},

	userId: function() {
		return Meteor.userId();
	},

	isRecipientOk: function() {
		return this.isRecipientOk.get();
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

Template.mail.onRendered(function() {
	if (window.location.hash.length > 0) {
		this.$('.recipient').val(window.location.hash.substr(1));
		this.$('form').show();
	}
})

var closeMessages = function(t) {
	$('.over').empty();
	t.$('.battle_letter').hide();
	t.$('.letter').hide();
	t.$('form').hide();
}

var toggleDeleteButton = function(t) {
	if (t.$('td input[type="checkbox"]:checked').length > 0) {
		t.$('.delete_selected').show();
	} else {
		t.$('.delete_selected').hide();
		// update first checkbox
		t.$('th input[type="checkbox"]').prop('checked', false);
	}
}

Template.mail.events({
	// Поставить чекбокс
	'click td:first-child': function(e, t) {
		e.stopPropagation();
		var checkbox = t.$(e.target).find('input');
		checkbox.prop('checked', checkbox.prop('checked') == true ? false: true);
		toggleDeleteButton(t);
	},

	'change th input[type="checkbox"]': function(e, t) {
		t.$('input[type="checkbox"]').prop('checked', t.$(e.target).prop('checked'));
		toggleDeleteButton(t);
	},

	// Открыть письмо
	'click tr:not(.header,.from_tamily)': function(e, t) {
		Meteor.call('mail.getLetter', e.currentTarget.dataset.id, function(err, letter) {
			if (err) {
				Notifications.error(err.error);
				return;
			}

			t.data.letter.set({
				_id: letter._id,
				to: letter.to,
				from: letter.from,
				sender: letter.sender,
				recipient: letter.recipient,
				name: letter.from == Meteor.userId() ? '-> ' + letter.recipient : letter.sender,
				subject: letter.subject,
				timestamp: letter.timestamp,
				text: letter.text
			});

			if (letter.to == Meteor.userId() && letter.status == game.Mail.status.unread) {
				Meteor.call('mail.readLetter', letter._id);
			}

			closeMessages(t);

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
							canVote: !result.userAnswer /*|| !Game.User.getVotePower() ? false : true*/
						}, 
						$('.over')[0]
					)
				})
			} else {
				t.$('.letter').show();
			}
		});
	},

	// Дейлик
	'click tr.from_tamily': function(e, t) {
		var dailyQuest = Game.Quest.getDaily();

		closeMessages(t);

		if (dailyQuest.status == Game.Quest.status.INPROGRESS) {

			// show inprogress daily quest
			Meteor.call('quests.getDailyInfo', function(err, quest) {
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
	},

	// Открыть форму написания письма
	'click .new_message': function(e, t) {
		closeMessages(t);
		t.$('form').show();
	},

	'click .delete_selected': function(e, t) {
		var selected = t.$('td input[type="checkbox"]:checked');
		var ids = [];

		for (var i = 0; i < selected.length; i++) {
			ids.push(t.$(selected[i]).parent().parent().data('id'));
		}
		
		if (ids) {
			Meteor.call('mail.removeLetters', ids);
		}

		t.$('.delete_selected').hide();
		t.$('th input[type="checkbox"]').prop('checked', false);
	},

	// Закрыть чтение / написание письма
	'click button.back': function(e, t) {
		e.preventDefault();
		$(e.currentTarget).parent().hide();
	},

	// Пожаловаться
	'click button.complain': function(e, t) {
		closeMessages(t);
		var letter = t.data.letter.get();
		if (letter) {
			Meteor.call('mail.complainLetter', letter._id, function(err, data) {
				if (err) {
					Notifications.error('Невозможно отправить жалобу', err.error);
				} else {
					Notifications.success('Жалоба отправлена');
				}
			});
		}
	},

	// Ответить на письмо
	'click button.reply': function(e, t) {
		var letter = t.data.letter.get();

		t.$('form .recipient').val(letter.from == Meteor.userId() ? letter.recipient : letter.sender);
		t.$('form .subject').val('Re: ' + letter.subject);

		t.$('form textarea').val('\n'.repeat(5) + '-'.repeat(20) + '\n>>' + letter.text.replace(/\n/g, '\n>> '));

		t.$('form').show();

		var textarea = t.find('form textarea');
		textarea.focus();
		textarea.selectionStart = 0;
		textarea.selectionEnd = 0;
	},

	// Отправить письмо
	'submit form': function(e, t) {
		e.preventDefault();

		t.$('input[type="submit"]').prop('disabled', true);

		Meteor.call(
			'mail.sendLetter', 
			t.find('form .recipient').value, 
			t.find('form .subject').value, 
			t.find('form textarea').value,
			function(err, response) {
				if (!err) {
					e.currentTarget.reset();
					t.data.isRecipientOk.set(false);
					closeMessages(t);
					t.$('input[type="submit"]').prop('disabled', false);
					Notifications.success('Письмо отправлено');
				} else {
					t.$('input[type="submit"]').prop('disabled', false);
					Notifications.error('Невозможно отправить письмо', err.error);
				}
			}
		);
	},

	'change input.recipient': function(e, t) {
		Meteor.call('mail.checkLogin', e.currentTarget.value, function(err, result) {
			t.data.isRecipientOk.set(result);
		});
	}
});

// ----------------------------------------------------------------------------
// Admin page
// ----------------------------------------------------------------------------

Game.Mail.showAdminPage = function() {
	var page = parseInt( this.getParams().page, 10 );
	var count = 20;

	if (!page || page < 1) {
		Router.go('mailAdmin', { page: 1 } );
	} else {
		Meteor.subscribe('adminMailPage', page, count);
		this.render('mailAdmin', {
			to: 'content',
			data: {
				page: page,
				count: count,
				letter: new ReactiveVar(null)
			}
		});
	}
}

Template.mailAdmin.helpers({
	countTotal: function() {
		return Game.Statistic.get('totalMailComplaints');
	},

	mail: function() {
		return Game.Mail.Collection.find({
			complaint: true
		}, {
			sort: { timestamp: -1 },
			limit: this.count
		}).fetch();
	},

	letter: function() {
		return this.letter.get();
	}
});

Template.mailAdmin.events({
	'click tr:not(.header)': function(e, t) {
		var letter = Game.Mail.Collection.findOne({'_id': e.currentTarget.dataset.id});
		t.data.letter.set(letter);
		closeMessages(t);
		t.$('.letter').show();
	},

	'click button.back': function(e, t) {
		e.preventDefault();
		$(e.currentTarget).parent().hide();
	},

	'click button.block': function(e, t) {
		closeMessages(t);

		var letter = t.data.letter.get();
		if (letter) {
			Meteor.call('mail.blockUser', letter.sender, 86400 * 7);
		}
	},

	'click button.cancel': function(e, t) {
		closeMessages(t);

		var letter = t.data.letter.get();
		if (letter) {
			// TODO: Write another method!
		}
	}
});


initMailQuizClient();

}