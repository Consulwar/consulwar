import researches from '/imports/content/Research/client';

initResearchClient = function() {
'use strict';

initResearchLib();

Game.Research.showPage = function() {
  let item;
  if (this.params.item) {
    const group = this.params.group[0].toUpperCase() + this.params.group.slice(1);
    const engName = this.params.item[0].toUpperCase() + this.params.item.slice(1);
    const id = `Research/${group}/${engName}`;
    item = researches[id];
  }

  if (item) {
    this.render('item_research', {to: 'content', data: {research: item}});
  } else {
    this.render('empty', {to: 'content'});
  }
};

Template.item_research.events({
  'click button.build': function(e, t) {
    var item = t.data.research;

    Meteor.call(
      'research.start',
      {
        id: item.id,
      },
      function(error, message) {
        if (error) {
          Notifications.error('Невозможно начать исследование', error.error);
        } else {
          Notifications.success('Исследование запущено');
        }
      },
    );

    if (item.getCurrentLevel() === 0) {
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