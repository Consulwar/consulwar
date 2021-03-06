export default {
  id: 'Unit/Human/Ground/Infantry/Lost',
  title: 'Потерянные',
  description: 'Потерянные — это элитные воины Бездны. Их мир просто ужасен. Сказать, что эти создания выжили в аду — значит не сказать ничего. Потерянные не знают страха, не понимают сути сострадания, они не верят в богов и не приемлют контроль над собой. Потерянные не несут в себе никакой идеологии, они видят лишь цель и не остановятся ни перед чем. Это разумные создания, но иногда их действия граничат с безумием. Всё, что нужно Потерянным — жертвоприношение. После того, как души невинных переходят в бездну, из неё выходят Потерянные, готовые рвать на куски врагов тех, кто их призвал.',
  basePrice: {
    humans: 4800,
    metals: 170000,
    crystals: 18666,
    time: 102166,
  },
  queue: 'Ground/Infantry',
  characteristics: {
    weapon: {
      damage: { min: 15000, max: 20000 },
      signature: 4,
    },
    health: {
      armor: 35000,
      signature: 7,
    },
  },
  targets: [
    'Unit/Reptile/Ground/Infantry/TooFucking',
    'Unit/Reptile/Ground/Infantry/Horror',
    'Unit/Reptile/Ground/Infantry/Striker',
  ],
  requirements() {
    return [
      ['Building/Military/Barracks', 75],
      ['Building/Military/Void', 45],
      ['Research/Evolution/DoomsDaySizing', 45],
    ];
  },
};
