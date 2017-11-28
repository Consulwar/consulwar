export default {
  id: 'Unit/Reptile/Ground/Air/Amphibian',
  title: 'Амфибия',
  description: 'Амфибия получила своё название благодаря способности находиться не только в небе, но и подниматься на высокую орбиту, сражаться в космосе и даже под водой. Собственно, зачастую эскадрильи Рептилий, состоящие из Амфибий, как раз и наносили коварные удары из-под воды, появляясь в тылу нашей армии. Чешуйчатым хитрости не занимать…',
  basePrice: {
    humans: 100,
    metals: 1200,
    crystals: 600,
    time: 180,
  },
  characteristics: {
    weapon: {
      damage: { min: 25000, max: 35000 },
      signature: 250,
    },
    health: {
      armor: 75000,
      signature: 22,
    },
  },
  targets: [
    'Unit/Human/Ground/Enginery/MotherTank',
    'Unit/Human/Ground/Enginery/EasyTank',
    'Unit/Human/Ground/Enginery/Agmogedcar',
  ],
};
