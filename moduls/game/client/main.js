Meteor.startup(function () {

initArtefactsClient();
initResourcesClient();
initBuildingClient();
initResearchClient();
initUnitClient();

initCosmosClient();
initEarthClient();

initMutualClient();

initMailClient();

initQuestLib();

initRouterClient();

initMenuClient();

initCheatsClient();

ChdFeedbackWidget.init({
	url: "//consulwar.helprace.com/chd-widgets/feedback",
	assetsUrl: "//d1culzimi74ed4.cloudfront.net/",
	feedbackType: "link"
});

Meteor.Spinner.options = {
    color: '#fff'
};

Notifications.defaultOptions.timeout = 5000;

Router.configure({
	loadingTemplate: 'loading'
})
/*
Router.map(function() {
	this.route('index', {path: '/'})

	this.route('register', {
		path: '/register',
		layoutTemplate: 'index',
		yieldTemplates: {
			'register_window': {to: 'modal'}
		}
	});
})*/

Router.route('/', function () {
	Session.set('totalUsersCount', '…');
	Session.set('onlineUsersCount', '…');
	
	this.layout('index');

	var user = Meteor.user();
	if (user) {
		if (user.blocked == true) {
			Meteor.logout();
			this.redirect('index');
			alert('Аккаунт заблокирован');
		} else {
			Router.go('game');
		}
	}

	this.render('empty', {to: 'modal'});

	Meteor.call('totalUsersCount', function(err, result) {
		Session.set('totalUsersCount', result);
	});

	Meteor.call('onlineUsersCount', function(err, result) {
		Session.set('onlineUsersCount', result);
	})

	if (window.Metrica != undefined) {
		Metrica.hit(window.location.href, 'Index', document.referrer);
	}

	$('.fancybox').fancybox();
}, {name: 'index'});

Template.index.helpers({
	totalUsersCount: function() { return Session.get('totalUsersCount'); },
	onlineUsersCount: function() { return Session.get('onlineUsersCount'); }
});

Template.index.events({
	'click .fancybox': function(e, t) {
		e.preventDefault();
	} 
});

Router.route('/logout', function () {
	Meteor.logout();
	this.redirect('index');
});

Router.route('register', {
	path: '/register',
	layoutTemplate: 'index',
	yieldTemplates: {
		'register_window': {to: 'modal'}
	}
});


Meteor.subscribe('game');
Meteor.subscribe('mail');
Meteor.subscribe('queue');
Meteor.subscribe('buildings');
Meteor.subscribe('units');
Meteor.subscribe('researches');
Meteor.subscribe('mutualResearch');


Meteor.subscribe('chat');
Meteor.subscribe('online');

test = Router.route('/test', function() {
	console.log('yes');
})


var menu = {
	planet: {
		residential: game.planet.residential, 
		counsul: game.planet.counsul, 
		military: game.planet.military,
	},
	army: {
		fleet: game.army.fleet,
		heroes: game.army.heroes,
		ground: game.army.ground
	},
	research: {
		evolution: game.research.evolution,
		fleetups: game.research.fleetups,
		mutual: game.research.mutual
	},
	/*powerups: {
		avaliable: [],
		activated: [],
		bought: []
	},
	alliance: {
		info: [],
		find: [],
		create: []
	},*/
	battle: {
		attack: _.map(Game.Battle.items, function(value) {
			return value;
		}),
		reinforcement: [],
		//statistics: [],
		earth: []
	},
	/*battle: {
		events: [],
		reinforcement: [],
		history: []
	},*/
	messages: {
		'private': [],
		//alliance: [],
		all: []
	},
	reptiles: {
		rfleet: game.reptiles.rfleet,
		rheroes: game.reptiles.rheroes,
		rground: game.reptiles.rground
	}
}

/*
Router.route('/game/:menu?/:side?/:item?', {
	name: 'game',

	before: function() {
		if (!Meteor.userId()) {
			this.redirect('index');
			return;
		}

		var user = Meteor.user();
		if (user && user.blocked == true) {
			Meteor.logout();
			this.redirect('index');
			alert('Аккаунт заблокирован');
		}

		if (this.params.menu && (this.params.menu in menu || this.params.menu in game)) {
			if (!(this.params.side && (this.params.side in menu[this.params.menu] || this.params.side in game[this.params.menu]))) {
				return this.redirect('game', {
					menu: this.params.menu,
					side: Object.keys(menu[this.params.menu])[0]
				})
			}
		} else {
			return this.redirect('game', {menu: 'planet'});
		}
			
		this.wait(Meteor.subscribe('game'));
		this.wait(Meteor.subscribe('resources'));
		this.wait(Meteor.subscribe('queue'));
		this.wait(Meteor.subscribe('buildings'));
		this.wait(Meteor.subscribe('units'));
		this.wait(Meteor.subscribe('researches'));

		if (this.ready()) {
			Session.set('active_menu', null);
			Session.set('active_side', null);
			Session.set('active_item', null);
			Session.set('point_info', null);

			Session.set('price', null);
			Session.set('priceEffects', null);
			Session.set('level', null);
			Session.set('investments', null);
			Session.set('effect', null);
			Session.set('requirements', null);

			Session.set('active_menu', this.params.menu);
			Session.set('active_side', this.params.side);
			this.next();
		} else {
			this.render('loading', {layout: 'loading_layout'})
		}
	},

	after: function() {
		if (window.Metrica != undefined) {
			Metrica.hit(window.location.href, 'Game', document.referrer);
		}
	},

	action: function() {
		this.render('game');

		if (this.params.menu == 'messages') {
			if (['all', 'alliance'].indexOf(this.params.side) != -1) {
				this.render('chat', {to: 'content'});
			} else {
				this.render('mail', {to: 'content'});
			}	
		} else if (this.params.menu == 'battle') {
			if (this.params.side == 'statistics') {
				var self = this;
				Meteor.call('getTopUsers', function(err, users) {
					for(var i = 0; i < users.length; i++) {
						users[i].place = i + 1;
					}

					self.render('rating', {to: 'content', data: {users: users}});
				});
			} else if (this.params.side == 'reinforcement') {
				this.render('reserve', {to: 'content'});
			} else if (this.params.side == 'earth') {
				this.render('earth', {to: 'content'});

				if (this.params.item) {
					var item = Game.Point.items[this.params.item];
					Session.set('active_item', item);
					Meteor.call('getPointInfo', this.params.item, function(err, info) {
						Session.set('point_info', info);
					});
						
				}
			} else {
				//this.render('battle', {to: 'content'});
				var item = Game.Battle.items[this.params.item];
				Session.set('active_item', item);
				this.render('battle', {to: 'content'});
				Session.set('currentBattleLevel', 1);
				$('select.battle_level').val(1);
			}	
		} else if (this.params.item && game[this.params.menu][this.params.side][this.params.item]) {
			var item = game[this.params.menu][this.params.side][this.params.item];
			Session.set('active_item', item);
			this.render('build', {to: 'content'});
		} else {
			this.render('empty', {to: 'content'});
		}

		updateItemInformation();
	
	
	}
});
*/

Session.set('serverTimeDelta', null);
Session.setDefault('serverTime', Math.floor(new Date().valueOf() / 1000));

Meteor.call('getCurrentTime', function(error, result) {
	Session.set('serverTimeDelta', new Date().valueOf() - result);
	var serverTime = Math.floor((new Date().valueOf() - Session.get('serverTimeDelta')) / 1000);
	Session.set('serverTime', serverTime);

	Meteor.setInterval(function() {
		var serverTime = Math.floor((new Date().valueOf() - Session.get('serverTimeDelta')) / 1000);
		Session.set('serverTime', serverTime);

		var queue = Game.Queue.getAll();
		for (var i = 0; i < queue.length; i++) {
			if (queue[i].finishTime <= serverTime) {
				Meteor.call('actualizeGameInfo');
				break;
			}
		}
	}, 1000);
});


Tracker.autorun(function () {
	if (Meteor.user() && Meteor.user().game) {
		var user = Meteor.user();

		if (user && user.blocked == true) {
			Meteor.logout();
			Router.go('index');
			alert('Аккаунт заблокирован');
		}

		Session.set('game', user.game);

		//var resources = Game.Resources.getValue();
		//Session.set('resources', resources);

		Session.set('currentQuest', user.game.quests.current);
		Session.set('login', user.login);
		Session.set('planetName', user.planetName);
	}
});

mutual = {
	item: null,
	sub: null
};


Meteor.setInterval(function() {
	console.log('actualize...');
	Meteor.call('actualizeGameInfo');
}, 60000);

var hasNewMailStatus = false;
Tracker.autorun(function() {
	var user = Meteor.user();
	if (user && user.game && user.game.quests.daily.status != game.Quest.status.finished
		|| Game.Mail.Collection.findOne({status: game.Mail.status.unread, to: Meteor.userId()})
		&& !hasNewMailStatus) {
		hasNewMailStatus = true;
	} else {
		hasNewMailStatus = false;
	}
});

Accounts.onLogin(function() {
	Meteor.call('actualizeGameInfo');
});
/*
Deps.autorun(function(){
	var user = Meteor.user();
	if(user && user.game){
		console.log('actualize...', _.clone(Meteor.user()));
		Meteor.call('actualizeGameInfo');
	}
});*/

var helpers = {
	information: function() {
		return Session.get('active_item');
	},
	active_menu: function() { return Session.get('active_menu'); },
	active_side: function() { return Session.get('active_side'); },
	active_item: function() { return Session.get('active_item'); },

	price: function() { return Session.get('price'); },
	priceEffects: function() { return Session.get('priceEffects'); },
	incomeEffects: function() { return Session.get('incomeEffects'); },
	income: function() { return Session.get('income'); },
	bonusStorage: function() { return Game.Resources.bonusStorage; },
	additionalArea: function() { return Session.get('additionalArea'); },
	//buildingTime: function() { return Session.get('buildingTime'); },
	level: function() { return Session.get('level'); },
	investments: function() { return Session.get('investments'); },
	count: function() { return Session.get('count'); },
	disableBuild: function() { return Session.get('disableBuild'); },
	enoughResources: function() { return Session.get('enoughResources'); },
	enoughCredits: function() { return Session.get('enoughCredits'); },
	effect: function() { return Session.get('effect'); },

	currentQuest: function() { return Session.get('currentQuest'); },

	currentConstruction: function() { return Session.get('currentConstruction'); },
	constructionRemaningTime: function() {
		var currentConstruction = Session.get('currentConstruction');
		return currentConstruction ? Math.max(currentConstruction.finishTime - Session.get('serverTime'), 0) : 0;
	},
	constructionProgress: function() {
		var currentConstruction = Session.get('currentConstruction');
		return currentConstruction ? Math.floor(
			Session.get('constructionRemaningTime') * 10 / (currentConstruction.finishTime - currentConstruction.startTime)) * 10 
			: 100;
	}, 

	game: function() {
		if (Meteor.user()) {
			return Session.get('game');
		}
	},
	resources: function() { return Session.get('resources'); },
	login: function() { return Session.get('login'); },
	planetName: function() { return Session.get('planetName'); },

	currentBattle: function() { return Session.get('currentBattle'); },

	hasNewMail: function() { 
		return (
			Meteor.user().game.quests.daily.status != game.Quest.status.finished
			|| Game.Mail.Collection.findOne({status: game.Mail.status.unread, to: Meteor.userId()})
		); 
	},

	connection: function() { return Meteor.status(); },
	reconnectTime: function() { return Session.get('reconnectTime'); }
};


Template.game.helpers(helpers);
//Template.build.helpers(helpers);
Template.item.helpers(helpers);
Template.battle.helpers(helpers);



Session.set('honor', 0);
Template.reserve.onRendered(function() {
	Session.set('honor', 0);
})

Template.reserve.helpers({
	units: function() {
		return _.map(game.army.ground, function(val, key) {
			return {
				engName: key,
				count: game.army.ground[key].currentLevel()
			}
		}).concat(_.map({hbhr: game.army.heroes.hbhr, lost: game.army.heroes.lost}, function(val, key) {
			return {
				engName: key,
				count: game.army.heroes[key].currentLevel()
			}
		}))
	},

	honor: function() { return Session.get('honor'); }
})

Template.reserve.events({
	'click .items li': function(e, t) {
		if (!$(e.currentTarget).hasClass('disabled')) {
			$(e.currentTarget).toggleClass('active');

			var current = $(e.currentTarget).find('div')[0];
			var name = current.className;
			var count = current.dataset.count;
			var honor = Session.get('honor');
				
			if (['hbhr', 'lost'].indexOf(name) != -1) {
				honor += Game.Resources.calculateHonorFromReinforcement(game.army.heroes[name].price(count)) * ($(e.currentTarget).hasClass('active') ? 1 : -1 )
			} else {
				honor += Game.Resources.calculateHonorFromReinforcement(game.army.ground[name].price(count)) * ($(e.currentTarget).hasClass('active') ? 1 : -1 )
			}

			Session.set('honor', honor);
		}
	},

	'click .select_all': function() {
		$('.items li:not(.disabled,.active)').click();
	},

	'click .send_reinforcement': function() {
		var active = $('.reserve .active div');
		var units = [];
		for (var i = 0; i < active.length; i++) {
			var name = active[i].className;
			
			units.push(name);
		}

		$('.reserve .active').removeClass('active');
		Session.set('SendToReserve', 0);

		Meteor.call('sendReinforcement', units, function(err, result) {
			if (err) {
				Notifications.error(err);
			} else {
				Notifications.info('Получено ' + result + ' чести', 'Замечательно!');
				Session.set('honor', 0);
			}
		});
	}
})


Template.game.events({
	'click header .username .edit': function() {
		var planetName = prompt('Как назвать планету?', Meteor.user().planetName);

		Meteor.call('changePlanetName', planetName, function(err, result) {
			if (err) {
				Notifications.error('Невозможно сменить название планеты', err.error);
			}
		});
	},


	'click progress.metals': function(e, t) {
		Meteor.call('getBonusResources', 'metals', function(error, result) {
			if (error) {
				Notifications.error('Нельзя получить бонусный металл', error.error);
			} else {
				Notifications.success('Бонусный металл получен', '+' + result);
			}
		})
	},

	'click progress.crystals': function(e, t) {
		Meteor.call('getBonusResources', 'crystals', function(error, result) {
			if (error) {
				Notifications.error('Нельзя получить бонусный кристалл', error.error);
			} else {
				Notifications.success('Бонусный кристалл получен', '+' + result);
			}
		})
	},

	'click .game .content .quest': function() {
		var who = '';
		var text = '';
		switch(Session.get('active_side')) {
			case 'residential':
				who = 'tamily';
				break;
			case 'counsul':
				who = 'portal';
				return ShowModalWindow(Template.support);
				break;
			case 'military':
				who = 'thirdenginery';
				text = 'Третий Инженерный на связи! Приятно вас снова видеть, Консул, после предыдущей работы над техникой во время первой волны освобождения Земли, нас перебросили в военную отрасль немного другого формата. В общем, мы теперь работаем над военными зданиями, правитель. Качество Гарантируем.';
				break;
			case 'fleet':
				who = 'vaha';
				text = 'Понятия не имею хуля я тут делаю, но эти ебланы из Совета не подпускают меня к войскам до начала боя. Посадили меня курировать флот консулов... Да ну и хер с ним, по летающим мишеням  стрелять веселее, верно ведь, Консул?';
				break;
			case 'heroes':
				who = 'psm';
				text = 'Рад, что вы снова с нами, Консул. Портал вновь открыт, но не время расслабляться. Вам, как и многим другим Консулам, придётся через многое пройти, чтобы победить Рептилий, но я уверен, что вы справитесь. На связи, Консул.';
				break;
			case 'ground':
				who = 'tilps';
				text = 'Я слежу за подготовкой солдат и техники к бою, Консул. Задача не из лёгких доложу я вам, но ведь никто не говорил, что будет просто, верно? В любом случае у нас с вами одна цель, спасибо за помощь, Консул. Мы это очень ценим, даже Вахаёбович, хотя он и не признается никогда.';
				break;
			case 'evolution':
				who = 'nataly';
				text = 'О! Здравствуйте, Командующий. Думаю, вы помните меня как руководителя десятой инженерной бригады. Ну что же это я, конечно помните. Теперь мы работаем над системами улучшения различных приборов, а так же совершаем новые открытия. Двигаем вперёд научный прогресс! В общем, Консул, если вам нужно что-то улучшить — сразу ко мне. И помните, для науки нет ничего невозможного!';
				break;
			case 'fleetups':
				who = 'mechanic';
				text = 'У меня много имён: Защитник, Перевозчик... но ты, Консул, можешь называть меня Механик. Я занимаюсь тем, что доставляю свежайшие и мощнейшие технологии для усиления флота. Если хочешь господствовать в небе, то ты обратился по адресу. Я сделаю твой флот в разы мощнее чем эти железяки чешуйчатых. Естественно не за бесплатно…';
				break;
			case 'mutual':
				who = 'calibrator';
				text = 'О, Консул! Я вас не заметил… я тут это, калибрую потихоньку. Знаете, тысячи различных приказов поступают ото всех Консулов галактики. Всё это нужно отсортировать, каталогизировать и разослать в научные отделы, а после, когда технология будет исследована, ещё и сообщить в Лаборатории на каждую из колоний… ох, извините, что загружаю. Пора возвращаться к калибровке.';
				break;
			case 'reinforcement':
				who = 'bolz';
				text = 'Доброго дня вам, Консул. Или сейчас ночь? В космосе хрен разберёшь. Если у вас есть какие-то войска на отправку, закидывайте это мясо в трюмы, мои ребята доставят их на Землю с ветерком... ну или не доставят, тут уж как повезёт.';
				break;
			case 'private':
				who = 'renexis';
				text = 'Привет';
				break;
		}


		if (who == 'tamily') {
			var quest = Meteor.user().game.quests.current;

			if (quest.status == game.Quest.status.finished) {
				Blaze.renderWithData(
					Template.reward, 
					{
						type: 'quest',
						title: [
							'Замечательно!', 
							'Прекрасно!', 
							'Отличная Работа!', 
							'Супер! Потрясающе!', 
							'Уникальный Талант!', 
							'Слава Консулу! ', 
							'Невероятно!', 
							'Изумительно!'
						][Math.floor(Math.random()*8)],
						reward: quest.reward
					}, 
					$('.over')[0]
				)
			} else {
				Blaze.renderWithData(
					Template.quest, 
					{
						who: 'tamily',
						type: 'quest',
						title: quest.conditionText, 
						text: quest.text, 
						reward: quest.reward,
						options: $.map(quest.options, function(values, name) {
							values.name = name;
							return values;
						}),
						isPrompt: quest.status == game.Quest.status.prompt
					}, 
					$('.over')[0]
				)
			}
		} else {
			Blaze.renderWithData(
				Template.quest, 
				{
					who: who,
					type: 'quest',
					//title: quest.conditionText, 
					text: text
				}, 
				$('.over')[0]
			)
		}
	}
});

Template.quest.events({
	'click a': function(e, t) {
		if (t.data.type == 'quest') {
			Meteor.call('questAction', e.target.dataset.option);
			Blaze.remove(t.view);
		} else {
			Meteor.call('dailyQuestAnswer', e.target.dataset.option, function(err, result) {
				var user = Meteor.user();
				Blaze.remove(t.view);

				Blaze.renderWithData(
					Template.quest, 
					{
						who: user.game.quests.daily.who || 'tamily',
						type: 'daily',
						title: user.game.quests.daily.name,
						text: result.text,
						reward: result.reward
					}, 
					$('.over')[0]
				)
			})
		}
	},

	'click .close': function(e, t) {
		Blaze.remove(t.view);
	}
});

Template.reward.events({
	'click .reward': function(e, t) {
		Meteor.call('getReward');
		Blaze.remove(t.view);
	}
});
/*
Template.build.events({
	'keyup .count, change .count': function(e, t) {
		var value = e.target.value.replace(/\D/g,'');
		value = value > 0 ? value : 1;

		var item = game[Session.get('active_menu')][Session.get('active_side')][Session.get('active_item').engName];

		var price = item.price(value);
		Session.set('price', price);
		Session.set('priceEffects', price.effects);
		Session.set('basePrice', price.base);

		Session.set('disableBuild', item.canBuild(value) ? false : true);
	},

	'click button.build': function(e, t) {
		var active_menu = Session.get('active_menu')
		  , active_side = Session.get('active_side')
		  , active_item = Session.get('active_item').engName;

		var item = game[active_menu][active_side][active_item];

		var build = {
			menu: active_menu, 
			side: active_side, 
			item: active_item, 
		};

		if (item.type == 'unit') {
			var value = parseInt(t.find('.count[type="number"]').value);
			check(value, Number)
			build.count = value;
		}

		if (e.target.dataset.action == 'invest') {
			build.investments = parseInt(t.find('.count[type="number"]').value);
			Meteor.call('invest', build, e.target.dataset.currency,
				function(error, message) {
					if (error) {
						Notifications.error('Невозможно вложиться', error.error);
					}
				}
			);
		} else {
			Meteor.call('build', build,
				function(error, message) {
					if (error) {
						Notifications.error('Невозможно начать строительство', error.error);
					} else {
						Notifications.success('Строительство запущено');
					}
				}
			);

			if (item.type != 'unit' && game[active_menu][active_side][active_item].currentLevel() == 0) {
				Router.go('game', {menu: active_menu, side: active_side});
			}
		}
	}
});*/

ShowModalWindow = function(template, data) {
	Blaze.renderWithData(
		template, 
		data, 
		$('.over')[0]
	)
}



});