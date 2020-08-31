import systemUsername from '../lib/systemUsername';

// should be before defining "Accounts.onCreateUser"
let systemUser = Meteor.users.findOne({ username: systemUsername });
if (!systemUser) {
  if (Meteor.settings.last) {
    const systemUserId = Accounts.createUser({
      username: systemUsername,
      password: uuid.new(),
    });

    Meteor.startup(() => Meteor.setTimeout(() => {
      Meteor.users.update({
        _id: systemUserId
      }, {
        $set: {
          username: systemUsername,
          plain_username: Game.User.convertUsernameToPlainname(systemUsername),
          planetName: systemUsername,
          game: {
            updated: Game.getCurrentTime()
          }
        }
      });

      systemUser = Meteor.users.findOne({ _id: systemUserId });

      Game.Resources.initialize(systemUser);
      Game.House.initialize(systemUser);
      Game.Quest.initialize(systemUser);
      Game.Statistic.initialize(systemUser);
      Game.Planets.initialize(systemUser);
    }, 1000));
  }

  const refreshSystemUser = Meteor.setInterval(() => {
    systemUser = Meteor.users.findOne({ username: systemUsername });
    if (systemUser && systemUser.planetName) {
      Meteor.clearInterval(refreshSystemUser);
    }
  }, 2000);
}


export default systemUser;