export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial15',
  condition: [
    ['Statistic/reinforcements.arrived.total', 1],
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
    Gammadrone: 10,
  },
};
