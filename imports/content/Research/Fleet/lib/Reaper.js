import Reaper from '/imports/content/Unit/Space/Human/lib/Reaper';

export default {
  id: 'Research/Fleet/Reaper',
  title: 'Усиление Пожинателя',
  description: 'Пожинателей собирали по схемам из другой вселенной. Мы, конечно, можем налепить на них больше брони и орудий, но здесь главное – это исследования самой системы корабля, внутри которой нас ждёт ещё очень много тайн. Например, усиленные Пожинатели после смерти способны самоуничтожаться, высвобождая огромное количество энергии; причём эта энергия не воздействует на союзные корабли, но в клочья разносит вражеские. Кто знает, что ещё таит в себе это металлическое страшилище.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Пожинателя +',
        textAfter: '%',
        condition: 'Unit/Space/Human/Reaper',
        priority: 2,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Броня Пожинателя +',
        textAfter: '%',
        condition: 'Unit/Space/Human/Reaper',
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
      honor: [220, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: Reaper.requirements,
};
