export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial15',
  condition: [
    ['Statistic/reinforcements.arrived.total', 1],
  ],
  slides: 3,
  helpers: [
    {
      url: '/game/mutual/earth/reserve/',
      condition: {
        target: '.earthReserve .zone-reserve .unit.active[data-id*=Father] .count',
        value: 1,
      },
      target: '.earthReserve .zone-reserve .btn-send',
      direction: 'top',
    },
    {
      url: '/game/mutual/earth/reserve/',
      target: '.earthReserve .zone-reserve .unit.active[data-id*=Father] .count',
      direction: 'left',
    },

    {
      url: '/game/mutual/earth',
      condition: {
        target: '.leaflet-pane .btn-reinforce',
        exists: true,
      },
      target: '.leaflet-pane .btn-reinforce',
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
