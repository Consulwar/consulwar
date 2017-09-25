import Gammadrone from '/imports/content/Unit/Space/Human/lib/Gammadrone';

export default {
  id: 'Research/Fleet/Gammadrone',
  title: 'Усиление Гаммадрона',
  description: 'После усиления брони и вооружения Дроны становятся ещё более опасным оружием в войне с проклятыми Рептилоидами. Благодаря улучшению конвейеров на заводах, мы сможем производить больше дронов, совокупная мощность которых сравни сильнейшим кораблям Галактики. При этом их новые системы наведения сделают возможным принимать урон на себя. То есть дешёвые дроны будут получать урон вместо дорогих кораблей.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Гаммадрона +',
        textAfter: '%',
        condition: 'Unit/Space/Human/Gammadrone',
        priority: 2,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Броня Гаммадрона +',
        textAfter: '%',
        condition: 'Unit/Space/Human/Gammadrone',
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
      honor: [10, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: Gammadrone.requirements,
};
