import TruckC from '/imports/content/Unit/Space/Human/lib/TruckC';

export default {
  id: 'Research/Fleet/TruckC',
  title: 'Усиление Трака С',
  description: 'Траки – это небоевые корабли, однако же они участвуют в бою, они ремонтируют корабли союзников и собирают ценные детали на поле боя, чтобы ваши сражения окупались. Так или иначе, без средств к существованию любая война будет проиграна очень быстро. И Рептилоиды тоже это понимают, поэтому они не позволят беспрепятственно летать вашим тракам и собирать ценный материал. Боюсь, Консул, вам придётся улучшать системы управления этих кораблей, чтобы они могли не получать урон во время боя.',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: 'Добыча Трака ',
        textAfter: ' металла',
        condition: {
          id: 'truckCapacity',
        },
        priority: 1,
        affect: 'metals',
        result(level = this.getCurrentLevel()) {
          if (level < 10) {
            return 2000 + (level * 20);
          } else if (level < 50) {
            return 2000 + (level * 40);
          } else if (level < 100) {
            return 2000 + (level * 80);
          }
          return 2000 + (level * 160);
        },
      },
      {
        notImplemented: true,
        textBefore: 'Добыча Трака ',
        textAfter: ' кристалла',
        condition: {
          id: 'truckCapacity',
        },
        priority: 1,
        affect: 'crystals',
        result(level = this.getCurrentLevel()) {
          if (level < 10) {
            return 1000 + (level * 10);
          } else if (level < 50) {
            return 1000 + (level * 20);
          } else if (level < 100) {
            return 1000 + (level * 40);
          }
          return 1000 + (level * 80);
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [400, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: TruckC.requirements,
};
