import Reaper from '/imports/content/Unit/Space/Human/lib/Reaper';

export default {
  id: 'Research/Fleet/Reaper',
  title: 'Усиление Пожинателя',
  description: 'Пожинателей собирали по схемам из другой вселенной. Мы, конечно, можем налепить на них больше брони и орудий, но здесь главное – это исследования самой системы корабля, внутри которой нас ждёт ещё очень много тайн. Например, усиленные Пожинатели после смерти способны самоуничтожаться, высвобождая огромное количество энергии; причём эта энергия не воздействует на союзные корабли, но в клочья разносит вражеские. Кто знает, что ещё таит в себе это металлическое страшилище.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Пожинателя +',
        condition: {
          id: 'Unit/Space/Human/Reaper',
        },
        priority: 1,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 300;
          } else if (level < 100) {
            return level * 600;
          }
          return level * 1200;
        },
      },
      {
        textBefore: 'Броня Пожинателя +',
        condition: {
          id: 'Unit/Space/Human/Reaper',
        },
        priority: 1,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 600;
          } else if (level < 100) {
            return level * 1200;
          }
          return level * 2400;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [2200, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: Reaper.requirements,
};
