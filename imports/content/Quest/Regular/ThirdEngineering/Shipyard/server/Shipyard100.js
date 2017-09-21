export default {
  id: 'Quest/Regular/ThirdEngineering/Shipyard/Shipyard100',
  condition: [
    ['Building/Military/Shipyard', 100],
  ],
  title: 'Построить Верфь 100-го уровня',
  text: '<p>Наши инженеры подумали над вашим мудрым замечанием, Командир, относительно того, что кто-то всё-таки должен возвращаться домой. Разумеется, если выбирать один корабль, то это должен быть ваш личный Флагман, Консул.</p><p>Поэтому Верфь разрабатывает варианты двигателя, который позволил бы вашему кораблю возвращаться даже после того, как весь ваш флот будет уничтожен. Мне тяжело думать о таком исходе, но обязанность хорошего инженера состоит в том, чтобы постараться предусмотреть всё.</p>',
  options: {
    accept: {
      text: 'Ты – хороший инженер, Третий.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 133,
    crystals: 133,
  },
};
