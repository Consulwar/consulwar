import { Meteor } from 'meteor/meteor';
import AbstractUniqueItem from '/imports/modules/Core/lib/AbstractUniqueItem';
import ResearchCollection from './ResearchCollection';


class ResearchAbstract extends AbstractUniqueItem {
  static getAllLevels({
    user,
    userId = user ? user._id : Meteor.userId(),
    researches = ResearchCollection.findOne({ user_id: userId }),
  } = {}) {
    return researches;
  }

  constructor(...args) {
    super(...args);

    this.type = 'research';

    // Legacy
    const idParts = args[0].id.split('/');
    this.group = idParts[idParts.length - 2];
    this.engName = idParts[idParts.length - 1];
  }

  getLevel(options) {
    const researches = ResearchAbstract.getAllLevels(options);
    return (researches && researches[this.id]) || 0;
  }

  has({ level, ...options }) {
    return this.getLevel(options) >= level;
  }
}

export default ResearchAbstract;
