import Frigate from '/imports/content/Unit/Space/Human/lib/Frigate';

export default {
  id: 'Research/Fleet/Frigate',
  title: 'Усиление Фрегата',
  description: 'Фрегат – потрясающий корабль. Его основная задача – вступать в бой с быстрыми истребителями и штурмовиками Ящериц. Впрочем, и кораблям покрупнее он может дать отпор, но всё же его боевые системы рассчитаны на огонь по шустрым целям. И с каждым усилением орудия становятся мощнее, их точность выше и убойная сила круче! Клинки Рептилоидов точно не скажут вам спасибо, когда вы выставите против них усиленный Фрегат.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Фрегата +',
        textAfter: '%',
        condition: 'Unit/Space/Human/Frigate',
        priority: 2,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Броня Фрегата +',
        textAfter: '%',
        condition: 'Unit/Space/Human/Frigate',
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
      honor: [30, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: Frigate.requirements,
};
