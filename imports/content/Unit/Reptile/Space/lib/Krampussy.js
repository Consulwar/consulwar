export default {
  id: 'Unit/Reptile/Space/Krampussy',
  title: 'Крампусси',
  description: 'Аналогично с историей Спарты, в мире Крампусов неудачные и слабые экземпляры скидывают в яму переработки, однако же некоторым удаётся выбраться оттуда. Круче эти ребята не становятся, но злее – это точно. Впрочем, уничтожаются с плевка, отчего их и зовут КрамПусси.',
  basePrice: {
    metals: 0,
    crystals: 0,
  },
  characteristics: {
    weapon: {
      damage: { min: 1, max: 1 },
      signature: 10,
    },
    health: {
      armor: 1,
      signature: 10,
    },
  },
  targets: [
    'Unit/Human/Space/Flagship',
    'Unit/Human/Space/Flagship',
    'Unit/Human/Space/Flagship',
  ],
  opponents: [
    'Unit/Human/Space/Gammadrone',
    'Unit/Human/Space/Wasp',
    'Unit/Human/Space/Mirage',
  ],
};
