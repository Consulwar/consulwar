import Frigate from '/imports/content/Unit/Space/Human/lib/Frigate';

export default {
  id: 'Research/Fleet/Frigate',
  title: 'Усиление Фрегата',
  description: 'Фрегат – потрясающий корабль. Его основная задача – вступать в бой с быстрыми истребителями и штурмовиками Ящериц. Впрочем, и кораблям покрупнее он может дать отпор, но всё же его боевые системы рассчитаны на огонь по шустрым целям. И с каждым усилением орудия становятся мощнее, их точность выше и убойная сила круче! Клинки Рептилоидов точно не скажут вам спасибо, когда вы выставите против них усиленный Фрегат.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Фрегата +',
        condition: {
          id: 'Unit/Space/Human/Frigate',
        },
        priority: 1,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 8;
          } else if (level < 100) {
            return level * 15;
          }
          return level * 30;
        },
      },
      {
        textBefore: 'Броня Фрегата +',
        condition: {
          id: 'Unit/Space/Human/Frigate',
        },
        priority: 1,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 20;
          } else if (level < 100) {
            return level * 40;
          }
          return level * 80;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [300, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: Frigate.requirements,
};
