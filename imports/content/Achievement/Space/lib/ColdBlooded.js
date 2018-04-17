export default {
  id: 'Achievement/Space/ColdBlooded',
  field: 'Reptiles/Killed/Reptiles/Fleet/Blade',
  levels: [100000],
  title: 'Хладнокровных хладнокровно',
  description: 'Уничтожил 100 000 Клинков',
  effects: {
    Military: [
      {
        textBefore: 'Броня флота +',
        textAfter: '%',
        condition: 'Unit/Human/Space',
        priority: 2,
        affect: 'life',
        result({ level }) {
          return (level > 0) ? 5 : 0;
        },
      },
    ],
  },
};
