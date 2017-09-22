export default {
  id: 'Quest/Regular/ThirdEngineering/Laboratory/Laboratory25',
  condition: [
    ['Building/Military/Laboratory', 25],
  ],
  title: 'Построить Лабораторию 25-го уровня',
  text: '<p>Приветствую, Командир! На нашей планете работает централизованная энергосеть, но в особых случаях людям бывают необходимы портативные генераторы. Учёные предлагают использовать в качестве реактива порошок из чистого Металла, постепенно окисляемый водой.</p><p>По предварительным результатам видно, что такая «батарейка» почти мгновенно выделяет достаточное количество энергии для кратковременного использования. Однако Лаборатория, как всегда, хочет провести дополнительные тесты.</p>',
  options: {
    accept: {
      text: 'Не сомневаюсь.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 3,
    crystals: 3,
  },
};
