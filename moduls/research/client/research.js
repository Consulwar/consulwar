initResearchClient = function() {
'use strict';

initResearchLib();

Game.Research.showPage = function() {
  var item = Game.Research.items[this.params.group][this.params.item];

  if (item) {
    this.render('item_research', {to: 'content', data: {research: item}});
  } else {
    this.render('empty', {to: 'content'});
  }
};

Template.item_research.events({
  'click button.build': function(e, t) {
    var item = t.data.research;

    Meteor.call('research.start', {
        group: item.group,
        engName: item.engName
      },
      function(error, message) {
        if (error) {
          Notifications.error('Невозможно начать исследование', error.error);
        } else {
          Notifications.success('Исследование запущено');
        }
      }
    );

    if (item.currentLevel() === 0) {
      Router.go(item.url({group: item.group}));
    }
  },

  'click .toggle_description': function(e, t) {
    $(t.find('.description')).slideToggle(function() {
      var options = Meteor.user().settings && Meteor.user().settings.options;
      Meteor.call('settings.setOption', 'hideDescription', !(options && options.hideDescription));
    });
  }
});

};