export default {
  id: 'Quest/Daily/Calibrator/NewTypeOfVirus',
  title: 'Вирус',
  text: 'Консул, это катастрофа! Нужно срочно что-то делать! Подсистема обработки и хранения данных заблокирована из-за угрозы лавинообразного заражения всей системы калибровки новым типом вируса! Единственный способ сохранить остальные данные — полное форматирование заражённого раздела. Что будем делать?',
  answers: {
    antivirus: {
      text: 'Запусти антивирус Кашпировского и побрызгай заряженной водой.',
      win: 'Поразительно, но этот метод сработал, Консул. Кажется, угроза устранена или, по крайней мере, локализована. Я запрошу службу информационной безопасности для дальнейших действий.',
      fail: 'Консул, Кашпировский прибегает к странным методам локализации угроз. Боюсь, в результате этого решения мы потеряли не только информацию, но и физический носитель.',
    },
    myPictures: {
      text: 'Там же все мои картиночки!',
      fail: 'Были, Консул. Были. Как и пара мамкобайт важных данных. Служба информационной безопасности успела удалённо ограничить угрозу до того, как она добралась до центральной базы данных.',
    },
    reload: {
      text: 'Перезагрузите и попробуйте снова.',
      win: 'Я до последнего не верил, что это может помочь, Консул, но иногда мне кажется, что я совсем ничего не понимаю в этом мире — перезагрузка полностью устранила проблему.',
      fail: 'Консул, я вынужден был отключить зараженный блок обработки и хранения данных. Перезагрузка всей системы не предусмотрена вовсе, так что ваше решение исполнить не выйдет.',
    },
  },
};
