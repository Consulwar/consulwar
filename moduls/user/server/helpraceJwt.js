import { Meteor } from 'meteor/meteor';
import jwt from 'jwt-simple';


if (
  Meteor.settings.public.helprace
) {
  if (
       !Meteor.settings.helprace
    || !Meteor.settings.helprace.secret
    || !Meteor.settings.public.helprace.subdomain
  ) {
    throw new Meteor.Error(
      'Ошибка в настройках',
      'Заданы не все настройки helprace (см. settings.sample helprace и public.helprace)',
    );
  }

  Meteor.methods({
    'helpraceJwt.login'() {
      Game.Log.method.call(this, 'helpraceJwt.login');
      const user = Meteor.user();
      if (user && user.emails && user.emails[0] && user.emails[0].verified) {
        let avatar = 'common/1';
        if (user.settings && user.settings.chat && user.settings.chat.icon) {
          avatar = user.settings.chat.icon;
        }

        const payload = {
          jti: uuid.new(),
          iat: Game.getCurrentServerTime(),
          email: user.emails[0].address,
          name: user.username,
          organization: user.alliance,
          job_title: Game.User.getLevelName(user.rating),
          avatar: `https://${Meteor.settings.public.domain}/img/game/chat/icons/${avatar}.png`,
          external_id: user._id,
        };

        return jwt.encode(payload, Meteor.settings.helprace.secret);
      }

      return false;
    },
  });
}
