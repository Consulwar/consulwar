import { Meteor } from 'meteor/meteor';
import AbstractUniqueItem from '/imports/modules/Core/lib/AbstractUniqueItem';
import BuildingCollection from './BuildingCollection';


class BuildingAbstract extends AbstractUniqueItem {
  static getAllLevels({
    user,
    userId = user ? user._id : Meteor.userId(),
    buildings = BuildingCollection.findOne({ user_id: userId }),
  } = {}) {
    return buildings;
  }

  constructor(...args) {
    super(...args);

    this.type = 'building';

    // Legacy
    const idParts = args[0].id.split('/');
    this.group = idParts[idParts.length - 2];
    this.engName = idParts[idParts.length - 1];
  }

  getLevel(options) {
    const buildings = BuildingAbstract.getAllLevels(options);
    return (buildings && buildings[this.id]) || 0;
  }

  has({ level = 1, ...options } = {}) {
    return this.getLevel(options) >= level;
  }
}

export default BuildingAbstract;
