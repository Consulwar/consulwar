export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial15',
  condition: [
    ['Statistic/reinforcements.arrived.total', 1],
  ],
  slides: 3,
  helpers: [
    {
      url: '/game/mutual/earth',
      condition: {
        target: '.cw--EarthReinforcement__unit .cw--EarthReinforcement__unitCount',
        value: 1,
      },
      target: '.cw--EarthReinforcement__send',
      direction: 'bottom',
    },
    {
      url: '/game/mutual/earth',
      condition: {
        target: '.cw--EarthReinforcement',
        exists: true,
      },
      target: '.cw--EarthReinforcement__unit',
      direction: 'left',
    },

    {
      url: '/game/mutual/earth',
      condition: {
        target: '.cw--EarthInfo__sendReinforcement',
        exists: true,
      },
      target: '.cw--EarthInfo__sendReinforcement',
      direction: 'bottom',
    },
    {
      url: '',
      target: 'header .menu li.earth:not(.active)',
      direction: 'bottom',
    },
  ],
  title: 'Отправить любые войска на любую территорию на Земле',
  text: '<p>Пока идет строительство, у вас тут волшебным образом появилась пара солдат. Думаю, их можно смело отправить воевать на Землю и получить за это немного Чести. Для этого нужно выбрать раздел с Землей, затем найти любую союзную (синюю территорию, после чего выбрать, какие войска вы желаете отправить на войну.</p>',
  options: {
    accept: {
      text: 'А я не знал, что мы сражаемся на Земле. Круто!',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Space/Gammadrone': 10,
  },
};
