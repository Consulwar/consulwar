import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import './UnitPopup.html';
import './UnitPopup.styl';

class UnitPopup extends BlazeComponent {
  template() {
    return 'UnitPopup';
  }

  constructor({
    hash: {
      unit,
    },
  }) {
    super();
    this.unit = unit;
  }

  onRendered() {
    super.onRendered();
    $('.scrollbar-inner').perfectScrollbar();
  }

  toggleDescription() {
    const options = Meteor.user().settings && Meteor.user().settings.options;
    $(this.find('.cw--UnitPopup__info')).slideToggle(function() {
      Meteor.call(
        'settings.setOption',
        'hideDescription',
        !(options && options.hideDescription),
      );
    });
  }

  closeWindow() {
    this.removeComponent();
  }
}

UnitPopup.register('UnitPopup');

export default UnitPopup;
