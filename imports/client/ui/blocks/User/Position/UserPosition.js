import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import './UserPosition.html';
import './UserPosition.styl';

const position = new ReactiveVar();
const updatePosition = function() {
  Meteor.call(
    'statistic.getUserPositionInRating',
    'general',
    Meteor.user().username,
    (err, result) => {
      if (!err && position.get() !== result.position) {
        position.set(result.position);
      }
    },
  );
};

Meteor.users.find().observeChanges({
  added(id, fields) {
    if (id === Meteor.userId()) {
      updatePosition(fields);
    }
  },

  changed(id, fields) {
    if (id === Meteor.userId() && fields.rating) {
      updatePosition(fields);
    }
  },
});

class UserPosition extends BlazeComponent {
  template() {
    return 'UserPosition';
  }

  constructor() {
    super();

    this.previousPosition = null;
    this.position = position;
    this.change = new ReactiveVar();
  }

  onRendered() {
    super.onRendered();

    this.autorun(() => {
      if (this.previousPosition) {
        this.change.set(this.previousPosition - position.get());
        Meteor.setTimeout(() => {
          this.change.set(null);
        }, 3000);
      }

      if (position.get()) {
        this.previousPosition = position.get();
      }
    });
  }
}

UserPosition.register('UserPosition');

export default UserPosition;
