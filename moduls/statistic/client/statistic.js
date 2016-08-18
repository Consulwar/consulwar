initStatisticClient = function() {

initStatisticLib();

Meteor.subscribe('statistic');

var isLoading = new ReactiveVar(true);
var detailStatisticView = new ReactiveVar(false);
var detailStatisticData = new ReactiveVar({});
var users = new ReactiveVar();
var countTotal = new ReactiveVar(false);
var reactiveSelectedUserName = new ReactiveVar(false);
var lastPageNumber;
var countPerPage = 20;

Game.Rating = {};

Game.Rating.showPage = function() {
	this.render('rating', { to: 'content' });

	var pageNumber = parseInt( this.params.page, 10 );
	var hash = this.getParams().hash;
	var selectedUserName;
	var detail = false;

	if (hash) {
		var hashArray = hash.split('/');
		selectedUserName = hashArray[0];
		reactiveSelectedUserName.set(selectedUserName);
		if (hashArray[1] == 'detail') {
			showUserDetailStatistic(selectedUserName);
			detail = true;
		}
	} else {
		reactiveSelectedUserName.set('');
	}

	if (pageNumber && pageNumber != lastPageNumber) {
		lastPageNumber = pageNumber;
		// reset scroll
		var element = $('.rating .data')[0];
		if (element) {
			element.scrollTop = 0;
		}
		isLoading.set(true);
		// show required page
		Meteor.call('statistic.getPageInRating', pageNumber, countPerPage, function(err, data) {
			isLoading.set(false);
			if (err) {
				Notifications.error('Не удалось загрузить страницу', err.error);
			} else {
				var skip = (pageNumber - 1) * countPerPage;
				var selectedUserСontain = false;

				data.users.forEach(function(user, i) {
					user.place = skip + i + 1;
					if (user.username == selectedUserName) {
						selectedUserСontain = true;
					}
				});

				if (selectedUserName && !selectedUserСontain) {
					showUser(selectedUserName, detail);
					return;
				}

				users.set(data.users);
				countTotal.set(data.count);

				Meteor.setTimeout(scrollToSelectedUser);
			}
		});
	} else if (!pageNumber){
		showUser(selectedUserName || Meteor.user().username, detail);
	} else {
		Meteor.setTimeout(scrollToSelectedUser);
	}
};

var showUser = function(userName, detail) {
	if (!userName){
		return Notifications.error('Введите имя пользователя');
	}
	
	isLoading.set(true);

	Meteor.call('statistic.getUserPositionInRating', userName, function(err, data) {
		isLoading.set(false);
		if (err) {
			Notifications.error('Не удалось загрузить страницу', err.error);
		} else {
			var userPage = (data.total > 0 && data.position > 0
				? Math.ceil( data.position / countPerPage )
				: 1
			);

			Router.go(
				'statistics',
				{ page: userPage },
				{ hash: userName + ( detail ? '/detail' : '' ) } 
			);
		}
	});
};

var showUserDetailStatistic = function(userName) {
	isLoading.set(true);

	Meteor.call('statistic.getUserStatistic', userName, function(err, data) {
		isLoading.set(false);
		if (err) {
			Notifications.error('Не удалось загрузить статистику пользователя', err.error);
		} else {
			detailStatisticView.set(true);
			detailStatisticData.set(data);
		}
	});
};

var hideUserDetailStatistic = function() {
	detailStatisticView.set(false);
	Router.go(
		'statistics',
		{ page: lastPageNumber },
		{ hash: reactiveSelectedUserName.get() }
	);
};

Template.rating.helpers({
	isLoading: function() {
		return isLoading.get();
	},

	users: function() {
		return users.get();
	},

	countTotal: function() {
		return countTotal.get();
	},

	selectedUserName: function() {
		return reactiveSelectedUserName.get();
	},

	detailStatisticView: function() {
		return detailStatisticView.get();
	},

	countPerPage: countPerPage,

	rank: function(rating) {
		return Game.User.getLevel(rating);
	},

	achievements: function (user) {
		var result = [];

		for (var key in user.achievements) {
			var item = Game.Achievements.items[key];
			var level = user.achievements[key].level;
			
			if (item && level > 0) {
				result.push({
					engName: item.engName,
					name: item.name(level),
					description: item.description(level),
					currentLevel: level,
					maxLevel: item.maxLevel(),
					effect: item.effect
				});
			}
		}

		return result;
	},

	mailHash: function(username) {
		return 'compose/' + username;
	},

	detailStatisticRoute: function (userName) {
		return Router.path(
			'statistics',
			{ page: Router.current().params.page },
			{ hash: userName + '/detail' }
		);
	}
});

var searchUser = function (e , t) {
	showUser(t.$('input[name="searchUserInRating"]').val());
};

Template.rating.events({
	'keyup input[name="searchUserInRating"]': function(e, t) {
		if (e.keyCode == 13) {
			searchUser(e, t);
		}
	},

	'click .search': searchUser,

	'click .returnToMe': function(e, t) {
		t.$('input[name="searchUserInRating"]').val('');
		showUser(Meteor.user().username);
	},

	'click .tab': function(e, t) {
		t.$('.tab').removeClass('active');
		$(e.currentTarget).addClass('active');
		t.$('.page').hide();
		t.$('.' + $(e.currentTarget).data('name')).show();
	}
});

var getField = function(obj, path) {
	var fields = path.split('.');
	return fields.reduce(function(last, now) {
		if (_.isObject(last)) {
			return last[now];
		} else {
			return last;
		}
	}, obj) || 0;
};

var createHtmlStatisticThree = function(statisticThree, data, path) {
	var ul = $('<ul>');
	for (var key in statisticThree) {
		var newPath = (path) ? path + '.' + key : key;
		if (_.isObject(statisticThree[key])) {
			ul.append($('<li><h3>' + (dictionary[key]||key) + '</h3></li>'));
			ul.append(createHtmlStatisticThree(statisticThree[key], data, newPath));
		} else {
			var num = getField(data, newPath);
			var text = ( dictionary[key]||key ) + ': ' + num;
			ul.append($('<li>', {text: text}));
		}
	}
	return ul;
};

var scrollToSelectedUser = function() {
	var userRow = $('.selectedUser')[0];
	if (userRow) {
		$('.rating .data')[0].scrollTop = userRow.offsetTop - 150;
	}
};

Template.detailStatistic.helpers({
	statisticThree: function(name) {
		return $('<ul class="treeline">').append(
			createHtmlStatisticThree(statisticThree[name], detailStatisticData.get(), '')
		)[0].outerHTML;
	}
});

Template.detailStatistic.events({
	'click .close': function(e, t) {
		hideUserDetailStatistic();
	}
});

Template.rating.onRendered(scrollToSelectedUser);

var dictionary = {
    '1': '1.',
    '2': '2.',
    '3': '3.',
    '4': '4.',
    '5': '5.',
    '6': '6.',
    '7': '7.',
    '8': '8.',
    '9': '9.',
    'army.ground': 'Земля',
    'reptiles.fleet': 'Флот',
    'resources': 'Ресурсы',
    'gained': 'Получено',
    'total': 'Всего',
    'spent': 'Потрачено',
    'humans': 'Люди',
    'crystals': 'Кристаллы',
    'metals': 'Метал',
    'honor': 'Медали',
    'credits': 'Кредитов',
    'weapon_parts': 'Обломки корабля',
    'silver_plasmoid': 'Серебрянный плазмоид',
    'crystal_fragments': 'Осколки кристалла',
    'ship_details': 'Детали корабля',
    'meteor_fragments': 'Обломки метеорита',
    'secret_technology': 'Секретные технологии',
    'emerald_plasmoid': 'Изумрудный плазмоид',
    'nanowires': 'Нанопроводка',
    'amethyst_plasmoid': 'Аметистовый плазмоид',
    'building': 'Строения',
    'research': 'Исследования',
    'battle': 'Битвы',
    'fleet': 'Флот',
    'defencefleet': 'Защитный флот',
    'patrolfleet': 'Патрульный флот',
    'tradefleet': 'Торговый флот',
    'battlefleet': 'Боевой флот',
    'cosmos': 'Космос',
    'fleets': 'Флот',
    'planets': 'Планеты',
    'reptiles': 'Рептилоиды',
    'killed': 'Убито',
    'reinforcements': 'Подкрепление',
    'army': 'Армия',
    'ground': 'Земля',
    'arrived': 'Прибыло',
    'quests': 'Квесты',
    'regular': 'Регулярные',
    'daily': 'Ежедневные',
    'chat': 'Чат',
    'rooms': 'Комнаты',
    'units': 'Юниты',
    'defense': 'Защищено',
    'lost': 'Потерянные',
    'mail': 'Почта',
    'investments': 'Инвестиции',
    'promocode': 'Промокоды',
    'cards': 'Карты',
    'sent': 'Отправлено',
    'discovered': 'Исследовано',
    'victory': 'Побед',
    'defeat': 'Поражений',
    'sphero': 'Сферо',
    'trioniks': 'Трионикс',
    'blade': 'Клинок',
    'lacertian': 'Ящер',
    'wyvern': 'Виверна',
    'dragon': 'Дракон',
    'fathers': 'Отцы',
    'agmogedcar': 'Бгоневички',
    'fast': 'Скорострелы',
    'grandmother': 'Бабули',
    'completed': 'Завершено',
    'completedQuestLines': 'Завершено цепочек',
    'win': 'Побед',
    'fail': 'Поражений',
    'messages': 'Сообщений',
    'status': 'Статус',
    'created': 'Создано',
    'motd': '',
    'dice': 'Брошено костей',
    'coub': 'Коубов',
    'gammadrone': 'Гаммадрон',
    'truckc': 'Трак С',
    'wasp': 'Оса',
    'frigate': 'Фригат',
    'mirage': 'Мираж',
    'cruiser': 'Крейсер',
    'bomb': 'Мины',
    'ionbomb': 'Ионные Мины',
    'turret': 'Турель',
    'laserturret': 'Лазерная Туррель',
    'carrier': 'Перевезено',
    'current': 'Текущий',
    'bought': 'Куплено',
    'activated': 'Активированно',
    'build': 'Построено'
};

var statisticThree = {
	development: {
		'resources': {
			'gained': {
				'humans': 4586298,
				'crystals': 7016266,
				'metals': 25791417,
				'honor': 201339,
				'credits': 52499,
				'weapon_parts': 94,
				'silver_plasmoid': 267,
				'crystal_fragments': 186,
				'ship_details': 109,
				'meteor_fragments': 152,
				'secret_technology': 17,
				'emerald_plasmoid': 64,
				'nanowires': 10,
				'amethyst_plasmoid': 5,
				'total': 37648723
			},
			'spent': {
				'metals': 43227117,
				'crystals': 11388630,
				'humans': 767286,
				'honor': 180009,
				'credits': 12525,
				'emerald_plasmoid': 58,
				'meteor_fragments': 140,
				'crystal_fragments': 180,
				'silver_plasmoid': 202,
				'secret_technology': 16,
				'total': 37648723
			}
		},

		'building': {
			'total': 661
		},

		'research': {
			'total': 355
		},

		'units': {
			'build': {
				'total': 30773,
				'army': {
					'ground': {
						'fathers': 12047,
						'agmogedcar': 6,
						'fast': 22,
						'grandmother': 10
					},
					'fleet': {
						'gammadrone': 16249,
						'truckc': 94,
						'wasp': 9,
						'frigate': 4,
						'mirage': 7,
						'cruiser': 1
					},
					'defense': {
						'bomb': 755,
						'ionbomb': 3,
						'turret': 1565,
						'laserturret': 1
					}
				}
			},
			'lost': {
				'total': 2870,
				'army': {
					'fleet': {
						'gammadrone': 1748,
						'wasp': 12,
						'mirage': 31,
						'truckc': 52,
						'frigate': 3,
						'cruiser': 2,
						'carrier': 1
					},
					'defense': {
						'ionbomb': 102,
						'bomb': 854,
						'turret': 65
					}
				}
			}
		}
	},

	war: {
		'cosmos': {
			'fleets': {
				'sent': 117
			},
			'planets': {
				'discovered': 61
			}
		},
		'battle': {
			'victory': 55,
			'defeat': 2,
			'total': 57,
			'patrolfleet': {
				'1': {
					'total': 9,
					'victory': 9
				},
				'2': {
					'total': 1,
					'victory': 1
				},
				'5': {
					'total': 3,
					'victory': 3
				},
				'6': {
					'total': 2,
					'victory': 2
				},
				'total': 15,
				'victory': 15,
				'defeat': 1
			},
			'defencefleet': {
				'1': {
					'total': 1,
					'victory': 1
				},
				'2': {
					'total': 2,
					'victory': 2
				},
				'3': {
					'total': 2,
					'victory': 2
				},
				'8': {
					'total': 1,
					'defeat': 1
				},
				'total': 6,
				'victory': 5
			},
			'tradefleet': {
				'1': {
					'total': 11,
					'victory': 11
				},
				'2': {
					'total': 6,
					'victory': 6
				},
				'3': {
					'total': 5,
					'victory': 5
				},
				'4': {
					'total': 1,
					'victory': 1
				},
				'5': {
					'total': 2,
					'victory': 2
				},
				'6': {
					'total': 1,
					'victory': 1
				},
				'total': 26,
				'victory': 26
			},
			'battlefleet': {
				'2': {
					'total': 1,
					'defeat': 1
				},
				'3': {
					'total': 6,
					'victory': 6
				},
				'4': {
					'total': 3,
					'victory': 3
				},
				'total': 10,
				'defeat': 1,
				'victory': 9
			}
		},
		'reptiles': {
			'killed': {
				'total': 2566,
				'reptiles.fleet': {
					'sphero': 1117,
					'trioniks': 133,
					'blade': 876,
					'lacertian': 319,
					'wyvern': 69,
					'dragon': 52
				}
			}
		},

		'reinforcements': {
			'sent': {
				'total': 12086,
				'army.ground': {
					'fathers': 12047,
					'agmogedcar': 6,
					'fast': 22,
					'lost': 1,
					'grandmother': 10
				}
			},
			'arrived': {
				'total': 10639,
				'army.ground': {
					'fathers': 10606,
					'agmogedcar': 4,
					'fast': 19,
					'lost': 1,
					'grandmother': 9
				}
			}
		},
	},

	consul: {
		'quests': {
			'regular': {
				'completed': 105,
				'completedQuestLines': 1
			},
			'daily': {
				'total': 133,
				'win': 69,
				'fail': 64
			}
		},
		'chat': {
			'messages': 10180,
			'status': 29,
			'motd': 17,
			'dice': 13,
			'coub': 3,
			'rooms': {
				'created': 1
			},
			'spent': {
				'credits': 550
			}
		},
		'mail': {
			'current': 532,
			'total': 532
		},

		'investments': {
			'total': 4,
			'metals': 21000,
			'crystals': 21000,
			'credits': 100
		},
		'promocode': {
			'total': 8
		},
		'cards': {
			'bought': 3,
			'activated': 3
		}
	}
};

initStatisticAchievementsClient();

};