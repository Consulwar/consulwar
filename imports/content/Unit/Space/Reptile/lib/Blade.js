export default {
  id: 'Unit/Space/Reptile/Blade',
  title: 'Клинок',
  description: 'Рептилии имеют очень мощный флот, а Клинок – самый быстрый космический истребитель-штурмовик из всех. В его классе нету иной техники равной ему. Клинок быстрый, он резок при манёврах и крайне опасен в ближнем бою. Ходят слухи, что пилотов этого аппарата Рептилии тренируют ещё с фазы яйца, воздействуя на развивающийся плод некими специальными волнами, меняющими цепочку ДНК. Ну, или это наши пилоты такие криворукие по сравнению с пилотами Рептилий…',
  basePrice: {
    humans: 10,
    metals: 15,
    crystals: 7.5,
    time: 60 + 45,
  },
  characteristics: {
    damage: {
      min: 320,
      max: 400,
    },
    life: 700,
  },
  targets: [
    'Unit/Space/Human/Gammadrone',
    'Unit/Space/Human/Wasp',
    'Unit/Space/Human/Mirage',
  ],
};
