export default {
  id: 'Unit/Ground/Air/Reptile/Amphibian',
  title: 'Амфибия',
  description: 'Амфибия получила своё название благодаря способности находиться не только в небе, но и подниматься на высокую орбиту, сражаться в космосе и даже под водой. Собственно, зачастую эскадрильи Рептилий, состоящие из Амфибий, как раз и наносили коварные удары из-под воды, появляясь в тылу нашей армии. Чешуйчатым хитрости не занимать…',
  basePrice: {
    humans: 100,
    metals: 1200,
    crystals: 600,
    time: 180,
  },
  characteristics: {
    damage: {
      min: 4400,
      max: 5500,
    },
    life: 2500,
  },
  targets: [
    'Unit/Ground/Enginery/Human/MotherTank',
    'Unit/Ground/Enginery/Human/EasyTank',
    'Unit/Ground/Enginery/Human/Agmogedcar',
  ],
};
