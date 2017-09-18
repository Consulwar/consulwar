export default {
  id: 'Achievement/Space/ColdBlooded',
  field: 'Reptiles/Killed/Reptiles/Fleet/Blade',
  levels: [100000],
  name: 'Хладнокровных хладнокровно',
  description: 'Уничтожил 100 000 Клинков',
  effects: {
    Military: [
      {
        textBefore: 'Броня флота +',
        textAfter: '%',
        condition: 'Unit/Space/Human',
        priority: 2,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 5 : 0;
        },
      },
    ],
  },
};
