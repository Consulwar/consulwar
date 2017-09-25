export default {
  id: 'Unit/Space/Human/TruckC',
  title: 'Трак C',
  description: 'Траки не обладают серьёзным вооружением, и могут сбить разве что парочку дронов. Но надо понимать, что Траки – это небоевые корабли, они нужны для того, чтобы собирать полезный лом после боя. Трюмы у обычных кораблей гораздо больше, однако трак имеет особые системы сканирования и технические устройства, благодаря которым только он может находить среди лома уничтоженных кораблей небольшие, но рабочие и полезные элементы. Так или иначе, имея Траки в своём флоте, вы получите больше ресурсов после победы.',
  basePrice: {
    humans: 10,
    metals: 120,
    crystals: 30,
    time: 15 * 60 * 60 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 10, max: 20 },
      signature: 20,
    },
    health: {
      armor: 60,
      signature: 80,
    },
  },
  targets: [
    'Unit/Space/Reptile/Sphero',
    'Unit/Space/Reptile/Blade',
    'Unit/Space/Reptile/Lacertian',
  ],
  requirements() {
    return [
      ['Building/Military/Shipyard', 20],
      ['Building/Military/Airfield', 20],
      ['Building/Military/Factory', 20],
    ];
  },
};
