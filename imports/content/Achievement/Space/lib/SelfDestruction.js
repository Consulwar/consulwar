export default {
  id: 'Achievement/Space/SelfDestruction',
  field: 'units.build.Unit/Human/Defense/DoomsDayGun',
  levels: [1],
  title: 'НГ+',
  description: 'Ну всё, пиздец',
  effects: {
    Price: [
      {
        textBefore: 'Юниты строятся на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human',
        priority: 50,
        affect: 'time',
        result({ level }) {
          return level * 5;
        },
      },
      {
        textBefore: 'Всё требует на -',
        textAfter: '% больше ресурсов',
        priority: 50,
        affect: ['humans', 'metals', 'crystals', 'honor'],
        result({ level }) {
          return level * 20 * -1;
        },
      },
      {
        textBefore: 'Ремонт юнитов дороже на -',
        textAfter: '%',
        condition: 'Unique/Repair',
        priority: 50,
        affect: ['metals', 'crystals'],
        result({ level }) {
          return level * 20 * -1;
        },
      },
    ],
    Income: [
      {
        textBefore: 'Приток ресурсов ',
        textAfter: '%',
        priority: 50,
        affect: ['humans', 'metals', 'crystals', 'honor'],
        result({ level }) {
          return level * 20 * -1;
        },
      },
    ],
    Military: [
      {
        textBefore: 'Урон флота ',
        textAfter: '%',
        condition: 'Unit/Human/Space',
        priority: 50,
        affect: 'damage',
        result({ level }) {
          return level * 20 * -1;
        },
      },
      {
        textBefore: 'Жизни флота ',
        textAfter: '%',
        condition: 'Unit/Human/Space',
        priority: 50,
        affect: 'life',
        result({ level }) {
          return level * 20 * -1;
        },
      },
      {
        textBefore: 'Урон наземной армии +',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 50,
        affect: 'damage',
        result({ level }) {
          return level * 20;
        },
      },
      {
        textBefore: 'Жизни наземной армии +',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 50,
        affect: 'life',
        result({ level }) {
          return level * 20;
        },
      },
    ],
  },
};
