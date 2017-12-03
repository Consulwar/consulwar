export default {
  id: 'Research/Fleet/Carrier',
  title: 'Усиление Авианосца',
  description: 'Как вам должно быть известно, основной урон Авианосцы наносят с помощью Дронов. На борту Авианосцев находятся настоящие заводы по производству всё новых и новых дронов. Вкупе с Траками, собирающими материал, прямо во время боя Авианосцы способны долгое время снабжать наши союзные корабли огневой поддержкой. Более того, улучшенные Авианосцы могут восстановить часть потерянных дронов в бою, что сэкономит вам кучу ресурсов, Консул.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Авианосца +',
        textAfter: '%',
        condition: 'Unit/Human/Space/Carrier',
        priority: 2,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Броня Авианосца +',
        textAfter: '%',
        condition: 'Unit/Human/Space/Carrier',
        priority: 2,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          return level * 0.4;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [120, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements() {
    return [
      ['Building/Military/Shipyard', 42],
      ['Building/Military/Barracks', 45],
      ['Research/Evolution/Ikea', 46],
    ];
  },
};
