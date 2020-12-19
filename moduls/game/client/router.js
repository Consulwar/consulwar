import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';
import LayoutMain from '/imports/client/ui/layouts/LayoutMain/LayoutMain';
import PageIndex from '/imports/client/ui/pages/Index/PageIndex';

import SoundManager from '/imports/client/ui/SoundManager/SoundManager';


initRouterClient = function() {
'use strict';

const parseQuery = function(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i += 1) {
      var pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

const registerRef = function() {
  const search = window.location.search;
  if (search) {
    const parts = parseQuery(search);

    if (parts.uuid) {
      window.localStorage.setItem('ref_uuid', parts.uuid);
    }
    if (parts.from) {
      window.localStorage.setItem('ref_from', parts.from);
    }
  }
}

window.GameRouteController = RouteController.extend({
  before: function() {
    registerRef();

    if (!Meteor.userId()) {
      this.redirect('index');
      return;
    }

    var user = Meteor.user();
    if (user && user.blocked === true) {
      Meteor.logout();
      this.redirect('index');
      alert('Аккаунт заблокирован');
    }

    this.wait(Meteor.subscribe('game'));
    this.wait(Meteor.subscribe('resources'));
    this.wait(Meteor.subscribe('queue'));
    this.wait(Meteor.subscribe('buildings'));
    this.wait(Meteor.subscribe('units'));
    this.wait(Meteor.subscribe('researches'));
    this.wait(Meteor.subscribe('quest'));

    if (this.ready()) {
      $('body').addClass('game');
      this.render('newgame');
      Tooltips.hide(); // hide all tooltips
      $('.permanent').hide(); // hide cosmos map!
      this.next();
    } else {
      this.render('loading', {layout: 'loading_layout'});
    }
  },

  after: function() {
    Meteor.setTimeout(function() {
      if ($('body').width() > 960) {
        $('.scrollbar-inner').perfectScrollbar();
        $('.scrollbar-inner').perfectScrollbar('update');
      }
    });

    if (window.yaCounter !== undefined) {
      Meteor.setTimeout(() => window.yaCounter.hit(window.location.href, 'Game', document.referrer), 100);
    }
  }
});

var gameRoutes = {
  planet: {
    building: 'planet/:group(Residential|Military)/:item?/:menu?'
  },

  house: {
    house: 'house/:subgroup?/:item?'
  },

  artefacts: {
    artefacts: 'resources/artefacts/:item'
  },

  admin: {
    promocodeHistory: 'promocode/history/:page/:filterType?/:filterValue?'
  },

  army: {
    unit: 'army/:group(Space|Defense|Ground)/:subgroup(Infantry|Enginery|Air)?/:item?',
  },

  research: {
    research: 'research/:group(Evolution|Fleet)/:item?'
  },

  earth: {
    mutual: 'mutual/:group(research)/:item?',
    earth: 'mutual/:group(earth)',
  },


  statistics: {
    statistics: 'statistics/:group(general|science|cosmos|battle|communication|krampus|krampussy)?/:page?'
  },

  chat: {
    chat: 'chat/:room',
    mail: 'mail/:page',
    mailAdmin: 'mailadmin/:page',
  },

  cosmos: {
    cosmos: 'cosmos',
  },
};

var gameActions = {
  building: Game.Building.showPage,
  research: Game.Research.showPage,
  house: Game.House.showPage,
  artefacts: Game.Resources.showArtefactsPage,

  promocodeHistory: Game.Payment.showPromocodeHistory,

  chat: Game.Chat.showPage,
  mail: Game.Mail.showPage,
  mailAdmin: Game.Mail.showAdminPage,

  unit: Game.Unit.showPage,

  mutual: Game.Mutual.showPage,
  earth: Game.Earth.showMap,
  statistics: Game.Rating.showPage,

  cosmos: Game.Cosmos.showPage,
};

var registerRoute = function(group, name, path, action) {
  Router.route('/game/' + path, {
    name: name,
    controller: 'GameRouteController',
    before: function() {
      this.group = group;
      this.next();
    },
    action: action
  });
};

for (var group in gameRoutes) {
  for (var name in gameRoutes[group]) {
    if (gameActions[name] === undefined) {
      throw new Error('Не найдено действие для роута', name, gameRoutes[group][name]);
    }
    registerRoute(group, name, gameRoutes[group][name], gameActions[name]);
  }
}

Router.route('/game/chat/alliance/:room', {
  name: 'chatAlliance',
  controller: 'GameRouteController',
  before: function() {
    registerRef();
    if (this.params.room.indexOf('alliance/') === -1) {
      this.params.room = 'alliance/' + this.params.room;
    }
    this.group = 'chat';
    this.next();
  },
  action: Game.Chat.showPage
});

Router.route('/game', {
  name: 'game',
  action: function() {
    registerRef();
    SoundManager.login();
    Router.go('building', {group: 'Residential'});
  }
});

Router.token = Random.secret(5);
Router.route('/logout', function () {
  registerRef();
  if (Router.token == Router.current().getParams().hash) {
    Meteor.logout();
  }
  this.redirect('index');
});

  Router.configure({
    loadingTemplate: 'loading',
  });

  Router.route('/', function() {
    registerRef();
    this.layout(LayoutMain.renderComponent());
    this.render(PageIndex.renderComponent());

    const user = Meteor.user();
    if (user) {
      if (user.blocked === true) {
        Meteor.logout();
        this.redirect('index');
      } else {
        Router.go('game');
      }
    }

    if (window.yaCounter !== undefined) {
      Meteor.setTimeout(() => window.yaCounter.hit(window.location.href, 'Index', document.referrer), 100);
    }
  }, { name: 'index' });

Router.route('pageNotFound', {
  path: '/(.+)',
  action: function() {
    registerRef();
    if (Meteor.user()) {
      return this.redirect('game');
    }
    return this.redirect('index');
  },
});

};