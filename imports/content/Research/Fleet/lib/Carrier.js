import Carrier from '/imports/content/Unit/Space/Human/lib/Carrier';

export default {
  id: 'Research/Fleet/Carrier',
  title: 'Усиление Авианосца',
  description: 'Как вам должно быть известно, основной урон Авианосцы наносят с помощью Дронов. На борту Авианосцев находятся настоящие заводы по производству всё новых и новых дронов. Вкупе с Траками, собирающими материал, прямо во время боя Авианосцы способны долгое время снабжать наши союзные корабли огневой поддержкой. Более того, улучшенные Авианосцы могут восстановить часть потерянных дронов в бою, что сэкономит вам кучу ресурсов, Консул.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Авианосца +',
        condition: 'Unit/Space/Human/Carrier',
        priority: 1,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 40;
          } else if (level < 100) {
            return level * 80;
          }
          return level * 160;
        },
      },
      {
        textBefore: 'Броня Авианосца +',
        condition: 'Unit/Space/Human/Carrier',
        priority: 1,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 90;
          } else if (level < 100) {
            return level * 180;
          }
          return level * 360;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [1200, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: Carrier.requirements,
};
