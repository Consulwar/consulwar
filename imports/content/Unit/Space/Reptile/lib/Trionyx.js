export default {
  id: 'Unit/Space/Reptile/Trionyx',
  title: 'Трионикс',
  description: 'Триониксы – это грузовые корабли рептилий: вооружения на них практически нет, кроме парочки небольших турелей на корпусе. В тоже время у этих кораблей довольно серьёзная броня и вместительные трюмы, в которых может быть много интересных вещей. Кто знает, что там перевозят Рептилоиды… Ресурсы? Артефакты? Голых Аргонианских Дев? Всё может быть, Консул… Не проверишь — не узнаешь.',
  basePrice: {
    humans: 150,
    metals: 1500,
    crystals: 300,
    time: 1200,
  },
  characteristics: {
    damage: {
      min: 80,
      max: 100,
    },
    life: 3500,
  },
  targets: [
    'Unit/Space/Human/Gammadrone',
    'Unit/Space/Human/Wasp',
    'Unit/Space/Human/Mirage',
  ],
};
