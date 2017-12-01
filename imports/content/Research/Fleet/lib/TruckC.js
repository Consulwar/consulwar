import TruckC from '/imports/content/Unit/Human/Space/lib/TruckC';

export default {
  id: 'Research/Fleet/TruckC',
  title: 'Усиление Трака С',
  description: 'Траки – это небоевые корабли, однако же они участвуют в бою, они ремонтируют корабли союзников и собирают ценные детали на поле боя, чтобы ваши сражения окупались. Так или иначе, без средств к существованию любая война будет проиграна очень быстро. И Рептилоиды тоже это понимают, поэтому они не позволят беспрепятственно летать вашим тракам и собирать ценный материал. Боюсь, Консул, вам придётся улучшать системы управления этих кораблей, чтобы они могли не получать урон во время боя.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Трака +',
        textAfter: '%',
        condition: 'Unit/Human/Space/TruckC',
        priority: 2,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Броня Трака +',
        textAfter: '%',
        condition: 'Unit/Human/Space/TruckC',
        priority: 2,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          return level * 0.4;
        },
      },
    ],
    /*
    Special: [
      {
        notImplemented: true,
        textBefore: 'Добыча Трака ',
        textAfter: '%',
        textAfter: ' металла',
        condition: 'Unique/truckCapacity',
        priority: 2,
        affect: 'metals',
        result(level = this.getCurrentLevel()) {
          if (level < 10) {
            return 20 + (level * 0.2);
          } else if (level < 50) {
            return 20 + (level * 0.4);
          } else if (level < 100) {
            return 20 + (level * 0.8);
          }
          return 20 + (level * 1.6);
        },
      },
      {
        notImplemented: true,
        textBefore: 'Добыча Трака ',
        textAfter: '%',
        textAfter: ' кристалла',
        condition: 'Unique/truckCapacity',
        priority: 2,
        affect: 'crystals',
        result(level = this.getCurrentLevel()) {
          if (level < 10) {
            return 10 + (level * 0.1);
          } else if (level < 50) {
            return 10 + (level * 0.2);
          } else if (level < 100) {
            return 10 + (level * 0.4);
          }
          return 10 + (level * 0.8);
        },
      },
    ],
    */
  },
  basePrice() {
    return {
      honor: [40, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: TruckC.requirements,
};
