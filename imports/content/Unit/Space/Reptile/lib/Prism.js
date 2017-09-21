export default {
  id: 'Unit/Space/Reptile/Prism',
  title: 'Призма',
  description: 'Основная задача Призмы в бою – это бить по крупным целям. Её орудия заряжены особыми ионными частицами, которые после попадания в цель, как электричество, тут же ищут выход в ближайшие цели, нанося урон и им тоже. Таким образом, Призма может уничтожать корабли, до которых прямым выстрелом не достать, а сама мощность орудия позволяет разносить в щепки даже такие крупные корабли, как Дредноут.',
  basePrice: {
    humans: 25000,
    metals: 1700,
    crystals: 600,
    time: 60 * 60,
  },
  characteristics: {
    damage: {
      min: 14400,
      max: 18000,
    },
    life: 85000,
  },
  targets: [
    'Unit/Space/Human/Dreadnought',
    'Unit/Space/Human/Railgun',
    'Unit/Space/Human/Reaper',
  ],
};
