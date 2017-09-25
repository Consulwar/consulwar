export default {
  id: 'Unit/Space/Reptile/Lacertian',
  title: 'Ящер',
  description: 'Один из самых быстрых штурмовых кораблей Рептилоидов – это Ящер. Способен вести бой как в космосе, так и в условиях атмосферы. Его манёвренность вкупе со скоростью, бронёй и уроном делает его одним из лучших кораблей данного класса в галактике. И несомненно, лучшим среди массового производства. Без усиленного флота, заточенного под уничтожение манёвренных кораблей, столкнуться с эскадрой Ящеров – это неминуемая смерть.',
  basePrice: {
    metals: 195,
    crystals: 80,
  },
  characteristics: {
    weapon: {
      damage: { min: 34, max: 42 },
      signature: 60,
    },
    health: {
      armor: 120,
      signature: 90,
    },
  },
  targets: [
    'Unit/Space/Human/Gammadrone',
    'Unit/Space/Human/Mirage',
    'Unit/Space/Human/Wasp',
  ],
};
