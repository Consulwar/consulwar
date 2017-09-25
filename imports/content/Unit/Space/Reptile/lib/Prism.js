export default {
  id: 'Unit/Space/Reptile/Prism',
  title: 'Призма',
  description: 'Основная задача Призмы в бою – это бить по крупным целям. Её орудия заряжены особыми ионными частицами, которые после попадания в цель, как электричество, тут же ищут выход в ближайшие цели, нанося урон и им тоже. Таким образом, Призма может уничтожать корабли, до которых прямым выстрелом не достать, а сама мощность орудия позволяет разносить в щепки даже такие крупные корабли, как Дредноут.',
  basePrice: {
    metals: 600000,
    crystals: 200000,
  },
  characteristics: {
    weapon: {
      damage: { min: 270000, max: 330000 },
      signature: 1250,
    },
    health: {
      armor: 1500000,
      signature: 1600,
    },
  },
  targets: [
    'Unit/Space/Human/Gammadrone',
    'Unit/Space/Human/Carrier',
    'Unit/Space/Human/Battleship',
  ],
};
