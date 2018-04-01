export default {
  id: 'Quest/Regular/ThirdEngineering/Airfield/Airfield60',
  condition: [
    ['Building/Military/Airfield', 60],
  ],
  title: 'Построить Аэродром 60-го уровня',
  text: '<p>Консул, необходимо ваше содействие: у нас возник небольшой конфликт между техобслуживанием и диспетчерской. Инженеры требуют ежедневного допуска к кораблям флота для проверки боеготовности, а диспетчеры говорят, что не успевают посылать подкрепления на Землю, а космические флоты – в бой.</p><p>А инженеры на это говорят, что не могут гарантировать безопасность полётов. А диспетчеры… Ну, в общем, вы уловили мою мысль, Командир.</p>',
  options: {
    accept: {
      text: 'Уловил. Держи ресурсы, но чтоб было тихо!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 1000,
    crystals: 1000,
  },
};
