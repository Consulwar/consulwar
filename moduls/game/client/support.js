var events = {
  'click .close': function(e, t) {
    e.preventDefault();
    Blaze.remove(t.view);
  },


  'click .write_message': function(e, t) {
    e.preventDefault();
    Blaze.remove(t.view);
    ChdFeedbackWidget.show();
  },

  'click .need_help': function(e, t) {
    Blaze.remove(t.view);

    ShowModalWindow(Template.needHelp);
  }
};

Template.support.events(events);
Template.needHelp.events(events);