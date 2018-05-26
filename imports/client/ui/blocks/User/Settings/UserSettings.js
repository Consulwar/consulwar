import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import { Notifications } from '/moduls/game/lib/importCompability';
import { Accounts } from 'meteor/accounts-base';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import ModalPrompt from '/imports/client/ui/blocks/Modal/Prompt/ModalPrompt';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/Input/Checkbox/InputCheckbox';
import '/imports/client/ui/button/button.styl';
import './UserSettings.html';
import './UserSettings.styl';

class UserSettings extends BlazeComponent {
  template() {
    return 'UserSettings';
  }

  onCreated() {
    super.onCreated();

    this.currentPassword = new ReactiveVar();
    this.newPassword = new ReactiveVar();
    this.newPasswordRepeat = new ReactiveVar();

    this.passwordRepeatValidators = [
      (value, errorBack) => {
        if (value.length < 6) {
          errorBack('Пароль не может быть короче 6 символов');
        } else {
          errorBack(false);
        }
      },
      (value, errorBack) => {
        if (
          this.newPassword.get()
          && this.newPasswordRepeat.get()
          && this.newPassword.get() !== this.newPasswordRepeat.get()
        ) {
          errorBack('Пароли не совпадают');
        } else {
          errorBack(false);
        }
      },
    ];

    const getUserSetting = (type, name) => (
      Meteor.user().settings[type]
      && Meteor.user().settings[type][name]
    ) || false;

    this.optionsList = [
      {
        name: 'Настройка уведомлений',
        options: [
          {
            type: 'notifications',
            name: 'showDesktopNotifications',
            title: 'Показывать уведомления на рабочем столе',
            value: getUserSetting('notifications', 'showDesktopNotifications'),
          },
          {
            type: 'notifications',
            name: 'showQuestsDuringActivation',
            title: 'Отображать Задания во время их активации',
            value: !getUserSetting('notifications', 'showQuestsDuringActivation'),
          },
        ],
      },
      {
        name: 'Настройка экрана',
        options: [
          {
            type: 'options',
            name: 'hideNet',
            title: 'Отключить сетку',
            value: getUserSetting('options', 'hideNet'),
          },
          {
            type: 'options',
            name: 'mobileVersion',
            title: 'Экспериментальная мобильная версия',
            value: getUserSetting('options', 'mobileVersion'),
          },
          {
            type: 'options',
            name: 'compactFleetInfo',
            title: 'Компактный информер флотов',
            value: getUserSetting('options', 'compactFleetInfo'),
          },
          {
            type: 'options',
            name: 'rotatePlanets',
            title: '«Крутить» планеты (нагрузка на CPU)',
            value: getUserSetting('options', 'rotatePlanets'),
          },
          {
            type: 'options',
            name: 'rareScreenUpdates',
            title: 'Обновлять экран раз в 20 секунд. Требуется перезапуск игры.',
            value: getUserSetting('options', 'rareScreenUpdates'),
          },
          {
            type: 'options',
            name: 'wideChat',
            title: 'Чат 100% ширины экрана',
            value: getUserSetting('options', 'wideChat'),
          },
          {
            type: 'options',
            name: 'showDistanceFromPlanets',
            title: 'Показывать расстояние при отправке флота',
            value: getUserSetting('options', 'showDistanceFromPlanets'),
          },
          {
            type: 'options',
            name: 'textUnits',
            title: 'Отображать юниты на карте текстом',
            value: getUserSetting('options', 'textUnits'),
          },
        ],
      },
      {
        name: 'Другие настройки',
        options: [
          // {
          //   name: 'moveCompletedUnitToHangar',
          //   title: 'Помещать построенные юниты в ангар',
          //   value: getUserSetting('options', 'moveCompletedUnitToHangar'),
          // },
          {
            name: 'disableAutoCollect',
            title: 'Автоматически собирать артефакты с планет рептилий',
            value: !getUserSetting('options', 'disableAutoCollect'),
          },
          {
            name: 'isMultiSkinEnabled',
            title: 'Сменяемые наряды',
            value: getUserSetting('options', 'isMultiSkinEnabled'),
          },
          {
            name: 'disableBroadcast',
            title: 'Скрывать оповещения',
            value: getUserSetting('options', 'disableBroadcast'),
          },
        ],
      },
    ];
  }

  onRendered() {
    super.onRendered();
    $('.cw--UserSettings__options').perfectScrollbar();
  }

  invertOption({
    user = Meteor.user(),
    name,
  }) {
    const currentValue = Game.Settings.getOption({ user, name });
    Meteor.call(
      'settings.setOption',
      name,
      !currentValue,
      (err) => {
        if (err) {
          Notifications.error(
            'Не удалось изменить настройки.',
            err.message,
          );
        } else {
          Notifications.success('Настройки успешно изменены.');
        }
      },
    );
  }

  changeEmail() {
    const currentEmail = Meteor.user().emails[0].address;
    Game.Popup.show({
      template: (new ModalPrompt({
        hash: {
          legend: 'Введите новый email',
          type: 'email',
          value: currentEmail,
          onAccept: (email) => {
            const mail = email.trim();
            if (mail === currentEmail) {
              return;
            }
            Meteor.call(
              'settings.changeEmail',
              currentEmail,
              mail,
              (err) => {
                if (err) {
                  Notifications.error(
                    'Не получилось изменить email',
                    err.message,
                  );
                } else {
                  Notifications.success('Email успешно изменён');
                }
              },
            );
          },
        },
      })).renderComponent(),
    });
  }
  verifyEmail(event, email) {
    Meteor.call(
      'settings.sendVerifyEmail',
      email,
      (err) => {
        if (err) {
          Notifications.error(
            'Не удалось отправить письмо верификации.',
            err.message,
          );
        } else {
          Notifications.success('Сообщение отправлено');
        }
      },
    );
  }
  setMailFrequency(event, frequency) {
    Meteor.call(
      'settings.setEmailLettersFrequency',
      frequency,
      (err) => {
        if (err) {
          Notifications.error(
            'Не удалось изменить частоту писем.',
            err.message,
          );
        } else {
          Notifications.success('Частота писем успешно изменена.');
        }
      },
    );
  }

  switchSubscription(event, email) {
    const { target } = event;
    const subscribed = target.checked;

    Meteor.call(
      'settings.setSubscribed',
      email,
      subscribed,
      (err) => {
        if (err) {
          target.checked = !subscribed;
          Notifications.error(
            `Не удалось ${subscribed ? 'подписаться на рассылку' : 'отписаться от рассылки'}`,
            err.message,
          );
        } else {
          Notifications.success(`Вы успешно ${subscribed ? 'подписались на рассылку' : 'отписались от рассылки'}`);
        }
      },
    );
  }

  changePassword(event) {
    event.preventDefault();

    if (this.newPassword.get().length < 6) {
      Notifications.error('Пароль должен содержать хотя бы 6 символов');
      return false;
    }

    if (this.newPassword.get() !== this.newPasswordRepeat.get()) {
      Notifications.error('Пароли не совпадают');
      return false;
    }

    Accounts.changePassword(
      this.currentPassword.get(),
      this.newPassword.get(),
      (err) => {
        if (err) {
          Notifications.error(err.message);
        } else {
          Notifications.success('Пароль успешно изменён');
          event.target.reset();
        }
      },
    );

    return true;
  }

  remindPassword() {
    Game.Popup.show({
      template: (new ModalPrompt({
        hash: {
          legend: 'Ваш е-mail адрес',
          type: 'email',
          value: Meteor.user().emails[0].address,
          onAccept: (userMail) => {
            if (userMail) {
              Accounts.forgotPassword(
                { email: userMail },
                (err) => {
                  if (err) {
                    Notifications.error(
                      'Восстановление пароля не удалось',
                      err.error,
                    );
                  } else {
                    Notifications.success('Способ восстановления кодов доступа отправлен на почту');
                  }
                },
              );
            }
          },
        },
      })).renderComponent(),
    });
  }

  switchNotifications(currentTarget) {
    const target = currentTarget;
    const field = target.name;

    if (!Notification) {
      target.checked = false;
      Notifications.error('Уведомления на рабочий стол не поддерживаются вашим браузером');
    } else if (Notification.permission === 'granted') {
      Meteor.call(
        'settings.changeNotificationsSettings',
        field,
        target.checked,
        (err) => {
          if (err) {
            target.checked = !target.checked;
            Notifications.error(
              'Не удалось изменить настройки.',
              err.message,
            );
          } else {
            Notifications.success('Настройки успешно изменены.');
          }
        },
      );
    } else if (Notification.permission === 'denied') {
      target.checked = false;
      Notifications.error('Сначала разрешите уведомления в настройках браузера.');
    } else if (Notification.permission === 'default') {
      Notification.requestPermission((permission) => {
        if (permission !== 'granted') {
          target.checked = false;
          Notifications.error('Сначала разрешите уведомления в настройках браузера');
          return;
        }
        Meteor.call(
          'settings.changeNotificationsSettings',
          field,
          true,
          (err) => {
            if (err) {
              Notifications.error('Не удалось изменить настройки.', err.message);
            } else {
              Notifications.success('Настройки успешно изменены.');
            }
          },
        );
      });
    }
  }

  switchShowQuestDuringActivation(currentTarget) {
    const target = currentTarget;
    const field = 'notShowQuestsDuringActivation';
    Meteor.call(
      'settings.changeNotificationsSettings',
      field,
      !target.checked,
      (err) => {
        if (err) {
          target.checked = !target.checked;
          Notifications.error(
            'Не удалось изменить настройки.',
            err.message,
          );
        } else {
          Notifications.success('Настройки успешно изменены.');
        }
      },
    );
  }

  switchSetting({ currentTarget }) {
    switch (currentTarget.name) {
      case 'showQuestsDuringActivation':
        this.switchShowQuestDuringActivation(currentTarget);
        break;
      case 'showDesktopNotifications':
        this.switchNotifications(currentTarget);
        break;
      default:
        this.invertOption({ name: currentTarget.name });
        break;
    }
  }
}

UserSettings.register('UserSettings');

export default UserSettings;
