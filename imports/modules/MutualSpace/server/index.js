import { Meteor } from 'meteor/meteor';
import collection from '../lib/collection';
import './methods';
import './adminMethods';
import './eviction';
import generateHexes from './generateHexes';

collection._ensureIndex({
  username: 1,
});

collection._ensureIndex({
  x: 1,
  z: 1,
});

Meteor.publish('spaceHex', function() {
  if (this.userId) {
    const user = Meteor.users.findOne({ _id: this.userId });
    return collection.find({ username: user.username });
  }
  return null;
});

export default function initMutualSpaceServer() {
  if (process.env.NODE_ENV === 'development') {
    // TODO: fix for calling on single process only
    if (collection.find({}).count() === 0) {
      generateHexes(collection, 5000);
      // eslint-disable-next-line no-console
      console.log('MutualSpace hexes are generated.');
    }
  }
}
