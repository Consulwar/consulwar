import { Meteor } from 'meteor/meteor';
import collection from '../lib/collection';
import './methods';
// import generateHexes from './generateHexes';

collection._ensureIndex({
  'username': 1,
});

Meteor.publish('spaceHex', function() {
  if (this.userId) {
    const user = Meteor.users.findOne({ _id: this.userId });
    return collection.find({ username: user.username });
  }
  return null;
});

export default function initMutualSpaceServer() {
  // TODO: fix for calling on single process only
  // if (collection.find({}).count() === 0) {
  //   generateHexes(collection, 5000);
  //   console.log("MutualSpace hexes are generated.");
  // }
}
