import { Meteor } from 'meteor/meteor';

Router.route('/helpraceAuth', function () {
  this.layout('auth');

  Meteor.autorun(() => {
    const user = Meteor.user();

    if (user) {
      if (user.emails && user.emails[0] && user.emails[0].verified) {
        Meteor.call('helpraceJwt.login', (err, result) => {
          if (err) {
            Notifications.error('Авторизация не удалась', err.error);
          } else {
            if (!result) {
              Notifications.error(
                'Авторизация не удалась',
                `Незвестная ошибка :-( ${result}`,
              );
            } else {
              window.location.href = `https://auth.helprace.com/jwt/${Meteor.settings.public.helprace.subdomain}?jwt=${result}`;
            }
          }
        });
      } else {
        Notifications.error('Сперва необходимо валидировать почту');
      }
    }
  });
}, { name: 'helpraceAuth' });
