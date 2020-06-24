function getPenalty({ level }) {
  const percentValue = ((1 - (0.8 ** level)) * 100);
  return (Math.round((percentValue * 100)) / 100) * -1;
}

export default {
  id: 'Achievement/Space/SelfDestruction',
  field: 'units.build.Unit/Human/Defense/DoomsDayGun',
  levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  title: level => `НГ${'+'.repeat(level)}`,
  description: 'Ну всё, пиздец',
  effects: {
    Price: [
      {
        textBefore: 'Юниты строятся на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human',
        priority: 10,
        affect: 'time',
        result({ level }) {
          return level * 5;
        },
      },
      {
        textBefore: 'Всё требует на -',
        textAfter: '% больше ресурсов',
        priority: 10,
        affect: ['humans', 'metals', 'crystals', 'honor'],
        result: getPenalty,
      },
      {
        textBefore: 'Ремонт юнитов дороже на -',
        textAfter: '%',
        condition: 'Unique/Repair',
        priority: 10,
        affect: ['metals', 'crystals'],
        result: getPenalty,
      },
    ],
    Income: [
      {
        textBefore: 'Приток ресурсов ',
        textAfter: '%',
        priority: 10,
        affect: ['humans', 'metals', 'crystals', 'honor'],
        result: getPenalty,
      },
    ],
    Military: [
      {
        textBefore: 'Урон флота ',
        textAfter: '%',
        condition: 'Unit/Human/Space',
        priority: 10,
        affect: 'damage',
        result: getPenalty,
      },
      {
        textBefore: 'Жизни флота ',
        textAfter: '%',
        condition: 'Unit/Human/Space',
        priority: 10,
        affect: 'life',
        result: getPenalty,
      },
      {
        textBefore: 'Урон наземной армии +',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 10,
        affect: 'damage',
        result({ level }) {
          return level * 20;
        },
      },
      {
        textBefore: 'Жизни наземной армии +',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 10,
        affect: 'life',
        result({ level }) {
          return level * 20;
        },
      },
    ],
  },
};
