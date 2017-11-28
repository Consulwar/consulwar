export default {
  id: 'Unit/Human/Ground/Infantry/Lost',
  title: 'Потерянные',
  description: 'Потерянные — это элитные воины Бездны. Их мир просто ужасен. Сказать, что эти создания выжили в аду — значит не сказать ничего. Потерянные не знают страха, не понимают сути сострадания, они не верят в богов и не приемлют контроль над собой. Потерянные не несут в себе никакой идеологии, они видят лишь цель и не остановятся ни перед чем. Это разумные создания, но иногда их действия граничат с безумием. Всё, что нужно Потерянным — жертвоприношение. После того, как души невинных переходят в бездну, из неё выходят Потерянные, готовые рвать на куски врагов тех, кто их призвал.',
  basePrice: {
    humans: 50000,
    time: 1,
  },
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
    'Unit/Reptile/Ground/Enginery/Slider',
    'Unit/Reptile/Ground/Infantry/Striker',
  ],
  requirements() {
    return [
      ['Building/Military/Barracks', 80],
      ['Building/Military/Void', 1],
    ];
  },
};
