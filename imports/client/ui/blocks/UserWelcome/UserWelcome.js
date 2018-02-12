import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/Input/input.styl';
import '/imports/client/ui/button/button.styl';
import './UserWelcome.html';
import './UserWelcome.styl';

class UserWelcome extends BlazeComponent {
  template() {
    return 'UserWelcome';
  }

  onCreated() {
    super.onCreated();
  }

  onRendered() {
  }

}

UserWelcome.register('UserWelcome');

export default UserWelcome;
