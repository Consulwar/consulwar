export default {
  id: 'Unit/Reptile/Ground/Enginery/Breaker',
  title: 'Дробилка',
  description: 'Дробилка Рептилоидов так названа из-за уникального импульсного орудия, установленного у этой техники по бокам. Прямое воздействие этого орудия на пехоту в течение нескольких секунд абсолютно незаметно физически, однако же в какой-то момент тело просто разрывает на куски. Сотня Дробилок может оставить после себя кровавое поле из кусков целой пехотной дивизии. Ко всему прочему, мобильность Дробилки и плазменное орудие на крыше позволяют ей неплохо справляться и с воздушной техникой.',
  basePrice: {
    humans: 10,
    metals: 150,
    crystals: 35,
    time: 20,
  },
  characteristics: {
    damage: {
      min: 120,
      max: 150,
    },
    life: 500,
  },
  targets: [
    'Unit/Human/Ground/Infantry/Horizontalbarman',
    'Unit/Human/Ground/Infantry/Fathers',
    'Unit/Human/Ground/Infantry/Psiman',
  ],
};
