export default {
  id: 'Unit/Space/Reptile/Blade',
  title: 'Клинок',
  description: 'Рептилии имеют очень мощный флот, а Клинок – самый быстрый космический истребитель-штурмовик из всех. В его классе нету иной техники равной ему. Клинок быстрый, он резок при манёврах и крайне опасен в ближнем бою. Ходят слухи, что пилотов этого аппарата Рептилии тренируют ещё с фазы яйца, воздействуя на развивающийся плод некими специальными волнами, меняющими цепочку ДНК. Ну, или это наши пилоты такие криворукие по сравнению с пилотами Рептилий…',
  basePrice: {
    metals: 100,
    crystals: 40,
  },
  characteristics: {
    weapon: {
      damage: { min: 13, max: 17 },
      signature: 25,
    },
    health: {
      armor: 48,
      signature: 55,
    },
  },
  targets: [
    'Unit/Space/Human/Gammadrone',
    'Unit/Space/Human/Wasp',
    'Unit/Space/Human/Mirage',
  ],
};
