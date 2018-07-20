export default {
  id: 'Unit/Human/Space/TruckC',
  title: 'Трак C',
  description: 'Траки не обладают серьёзным вооружением, и могут сбить разве что парочку дронов. Но надо понимать, что Траки – это небоевые корабли, они нужны для того, чтобы собирать полезный лом после боя. Трюмы у обычных кораблей гораздо больше, однако трак имеет особые системы сканирования и технические устройства, благодаря которым только он может находить среди лома уничтоженных кораблей небольшие, но рабочие и полезные элементы. Так или иначе, имея Траки в своём флоте, вы получите больше ресурсов после победы.',
  basePrice: {
    humans: 10,
    metals: 120,
    crystals: 30,
  },
  queue: 'Space/Heavy',
  decayTime: 60 * 60,
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
    'Unit/Reptile/Space/Sphero',
    'Unit/Reptile/Space/Blade',
    'Unit/Reptile/Space/Lacertian',
  ],
  requirements() {
    return [
      ['Building/Military/Shipyard', 100],
      ['Building/Military/Airfield', 100],
      ['Building/Military/Factory', 100],
    ];
  },
};
