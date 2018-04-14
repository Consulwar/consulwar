export default {
  id: 'Unit/Reptile/Space/Trionyx',
  title: 'Трионикс',
  description: 'Триониксы – это грузовые корабли рептилий: вооружения на них практически нет, кроме парочки небольших турелей на корпусе. В тоже время у этих кораблей довольно серьёзная броня и вместительные трюмы, в которых может быть много интересных вещей. Кто знает, что там перевозят Рептилоиды… Ресурсы? Артефакты? Голых Аргонианских Дев? Всё может быть, Консул… Не проверишь — не узнаешь.',
  basePrice: {
    metals: 130,
    crystals: 40,
  },
  characteristics: {
    weapon: {
      damage: { min: 10, max: 10 },
      signature: 20,
    },
    health: {
      armor: 350,
      signature: 200,
    },
  },
  targets: [
    'Unit/Human/Space/Gammadrone',
    'Unit/Human/Space/Wasp',
    'Unit/Human/Space/Mirage',
  ],
  opponents: [
    'Unit/Human/Space/Railgun',
    'Unit/Human/Space/Frigate',
    'Unit/Human/Space/Cruiser',
  ],
};
